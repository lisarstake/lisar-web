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

    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    return {
      success: response.ok,
      message: data.message,
      data: data.data ?? data,
      error: response.ok ? undefined : data.error,
    } as T;
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

    try {
      return await this.makeRequest<GasTopupResponse>("/admin/gas-topup", {
        method: "POST",
        body: JSON.stringify(request),
      });
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to top up gas",
        error: error.message || "Unknown error",
      };
    }
  }
}

