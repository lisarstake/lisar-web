/**
 * KYC API Service
 * Real implementation for Lisar API v1
 */

import { IKycApiService } from "./api";
import {
  KycApiResponse,
  KycStatusData,
  StartKycRequest,
  StartKycData,
  KycSessionData,
  KycDetailsData,
  KYC_CONFIG,
} from "./types";

export class KycService implements IKycApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = KYC_CONFIG.baseUrl;
    this.timeout = KYC_CONFIG.timeout;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn401: boolean = true
  ): Promise<KycApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    const token = this.getStoredToken();
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle 401 Unauthorized - Token might be expired
      if (response.status === 401 && retryOn401) {
        const refreshToken = this.getStoredRefreshToken();
        if (refreshToken) {
          try {
            // Attempt to refresh the token
            const refreshResult = await this.refreshToken(refreshToken);
            if (refreshResult.success) {
              // Retry the original request with new token
              return this.makeRequest<T>(endpoint, options, false);
            }
          } catch (error) {
            // Token refresh failed - will remove tokens and return error
          }
        }
        this.removeStoredTokens();
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "An error occurred",
          data: null as T,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        message: data.message,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        data: null as T,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Token management helpers
  private getStoredToken(): string | null {
    // Check localStorage first (remembered sessions)
    let token = localStorage.getItem("auth_token");

    if (!token) {
      token = sessionStorage.getItem("auth_token");
    }

    return token;
  }

  private getStoredRefreshToken(): string | null {
    return (
      localStorage.getItem("refresh_token") ||
      sessionStorage.getItem("refresh_token")
    );
  }

  private removeStoredTokens(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_expiry");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("auth_expiry");
  }

  private async refreshToken(refreshToken: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.data?.access_token) {
        const storage = localStorage.getItem("refresh_token")
          ? localStorage
          : sessionStorage;
        storage.setItem("auth_token", data.data.access_token);
        storage.setItem("refresh_token", data.data.refresh_token);

        if (data.data.expires_at) {
          storage.setItem("auth_expiry", data.data.expires_at.toString());
        }

        return { success: true };
      }

      return { success: false };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Get user's KYC verification status
   */
  async getStatus(): Promise<KycApiResponse<KycStatusData>> {
    return this.makeRequest<KycStatusData>("/kyc/status", {
      method: "GET",
    });
  }

  /**
   * Start KYC verification process
   */
  async startVerification(
    request: StartKycRequest
  ): Promise<KycApiResponse<StartKycData>> {
    return this.makeRequest<StartKycData>("/kyc/start", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Get current verification session URL
   */
  async getSession(): Promise<KycApiResponse<KycSessionData>> {
    return this.makeRequest<KycSessionData>("/kyc/session", {
      method: "GET",
    });
  }

  /**
   * Get full KYC details (fetched on-demand from provider)
   */
  async getDetails(): Promise<KycApiResponse<KycDetailsData>> {
    return this.makeRequest<KycDetailsData>("/kyc/details", {
      method: "GET",
    });
  }
}
