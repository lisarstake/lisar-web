/**
 * Wallet API Service
 * Real implementation for wallet operations
 */

import { IWalletApiService } from "./api";
import {
  WalletApiResponse,
  WalletData,
  BalanceResponse,
  ExportResponse,
  WALLET_CONFIG,
} from "./types";
import { http } from "@/lib/http";

export class WalletService implements IWalletApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = WALLET_CONFIG.baseUrl;
    this.timeout = WALLET_CONFIG.timeout;
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
  ): Promise<WalletApiResponse<T>> {
    try {
      // Add authorization header if token exists
      const token = this.getStoredToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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
        data: response.data.wallet || response.data.data || response.data,
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

  // Get wallet by ID
  async getWallet(walletId: string): Promise<WalletApiResponse<WalletData>> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        data: null as unknown as WalletData,
        message: "Authentication required",
        error: "No authentication token found",
      };
    }

    return this.makeRequest<WalletData>(`/wallet/${walletId}`, {
      method: "GET",
    });
  }

  // Get wallet balance
  async getBalance(walletAddress: string, token: 'ETH' | 'LPT'): Promise<BalanceResponse> {
    const token_auth = this.getStoredToken();
    if (!token_auth) {
      return {
        success: false,
        balance: "0",
      };
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token_auth}`,
      };

      const response = await http.request({
        url: `${this.baseUrl}/wallet/balance?walletAddress=${walletAddress}&token=${token}`,
        method: "GET",
        headers,
        timeout: this.timeout,
      });

      return {
        success: true,
        balance: response.data.balance || "0",
      };
    } catch (error: any) {
      return {
        success: false,
        balance: "0",
      };
    }
  }

  // Export wallet private key
  async exportWallet(walletId: string): Promise<ExportResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        privateKey: "",
      };
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await http.request({
        url: `${this.baseUrl}/wallet/${walletId}/export`,
        method: "GET",
        headers,
        timeout: this.timeout,
      });

      return {
        success: true,
        privateKey: response.data.privateKey || "",
      };
    } catch (error: any) {
      return {
        success: false,
        privateKey: "",
      };
    }
  }
}
