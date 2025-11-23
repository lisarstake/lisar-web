/**
 * Admin Gas API Service
 */

import {
  GasTopupRequest,
  GasTopupResponse,
  GAS_CONFIG,
} from "./types";
import { IGasApiService } from "./api";

export class GasService implements IGasApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = GAS_CONFIG.baseUrl;
    this.timeout = GAS_CONFIG.timeout;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = this.getStoredToken();
    if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;

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
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          message: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
          error: data.error || data.message || `Request failed with status ${response.status}`,
          data: data.data,
        } as T;
      }

      return {
        success: true,
        message: data.message,
        data: data.data,
        error: undefined,
      } as T;
    } catch (error: any) {
      // Handle network errors, timeouts, etc.
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return {
          success: false,
          message: "Request timeout. Please try again.",
          error: "Request timeout",
        } as T;
      }
      
      return {
        success: false,
        message: error.message || "Network error. Please check your connection and try again.",
        error: error.message || "Network error",
      } as T;
    }
  }

  // Token helper
  private getStoredToken(): string | null {
    return (
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  }

  // Top up ETH for user wallets below threshold
  async topupGas(request: GasTopupRequest): Promise<GasTopupResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "Not authenticated",
        error: "No authentication token found",
      };
    }

    // Validate request
    if (!request.amount || parseFloat(request.amount) <= 0) {
      return {
        success: false,
        message: "Invalid amount. Please provide a valid positive number.",
        error: "Invalid amount",
      };
    }

    return await this.makeRequest<GasTopupResponse>("/admin/gas-topup", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }
}

