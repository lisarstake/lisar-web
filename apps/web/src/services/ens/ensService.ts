/**
 * ENS API Service
 * Real implementation for ENS operations
 */

import { IEnsApiService } from "./api";
import {
  EnsApiResponse,
  EnsIdentity,
  ENS_CONFIG,
} from "./types";
import { http } from "@/lib/http";

export class EnsService implements IEnsApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = ENS_CONFIG.baseUrl;
    this.timeout = ENS_CONFIG.timeout;
  }

  // Token management helpers
  private getStoredToken(): string | null {
    // Check localStorage first (remembered sessions)
    let token = localStorage.getItem("auth_token");

    // Check if token has expired (if rememberMe was used)
    const expiry = localStorage.getItem("auth_expiry");
    if (token && expiry) {
      const expiryTime = parseInt(expiry) * 1000; // Convert to milliseconds
      if (Date.now() > expiryTime) {
        // Token expired, clear it
        this.removeStoredTokens();
        return null;
      }
    }

    // If not in localStorage, check sessionStorage
    if (!token) {
      token = sessionStorage.getItem("auth_token");
    }

    return token;
  }

  private removeStoredTokens(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expiry");
    sessionStorage.removeItem("auth_token");
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    config: any = {}
  ): Promise<EnsApiResponse<T>> {
    try {
      // Require authorization token
      const token = this.getStoredToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...config.headers,
      };

      const response = await http.request({
        url: `${this.baseUrl}${endpoint}`,
        timeout: this.timeout,
        headers,
        ...config,
      });

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Success",
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as T,
        message: error.response?.data?.message || "An error occurred",
        error: error.response?.data?.error || error.message || "Unknown error",
      };
    }
  }

  /**
   * Get ENS identity for a single address or ENS name
   */
  async getEnsIdentity(addressOrEns: string): Promise<EnsApiResponse<EnsIdentity>> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        data: null as unknown as EnsIdentity,
        message: "Authentication required",
        error: "No authentication token found",
      };
    }

    return this.makeRequest<EnsIdentity>(`/ens/identity/${addressOrEns}`, {
      method: "GET",
    });
  }

  /**
   * Batch fetch ENS identities for multiple addresses
   * Only includes entries where ENS data is actually available
   */
  async getBatchEnsIdentities(
    addressesOrEns: string[]
  ): Promise<Record<string, EnsIdentity>> {
    try {
      // Fetch all identities in parallel
      const promises = addressesOrEns.map((address) =>
        this.getEnsIdentity(address)
      );
      const results = await Promise.allSettled(promises);

      // Build a map of address to identity (only for successful fetches)
      const identityMap: Record<string, EnsIdentity> = {};

      results.forEach((result, index) => {
        const address = addressesOrEns[index];
        if (result.status === "fulfilled" && result.value.success && result.value.data) {
          identityMap[address] = result.value.data;
        }
        // Don't add anything if ENS data is not available
      });

      return identityMap;
    } catch (error) {
      console.error("Failed to batch fetch ENS identities:", error);
      // Return empty map on error
      return {};
    }
  }
}
