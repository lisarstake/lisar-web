/**
 * Admin Health API Service
 */

import {
  HealthApiResponse,
  ExternalServicesHealth,
  AdminPanelHealth,
  HEALTH_CONFIG,
} from "./types";

export class HealthService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = HEALTH_CONFIG.baseUrl;
    this.timeout = HEALTH_CONFIG.timeout;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<HealthApiResponse<T>> {
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

      return {
        success: response.ok,
        message: data.message,
        // some admin endpoints are not wrapped in {data}
        data: (data.data as T) ?? (data as T),
        error: response.ok ? undefined : data.error,
      } as HealthApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        data: null as unknown as T,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Token helper (for authenticated requests)
  private getStoredToken(): string | null {
    return (
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  }

  // Helper to check authentication before making request
  private checkAuth<T>(): HealthApiResponse<T> | null {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "Not authenticated",
        data: null as unknown as T,
        error: "No authentication token found",
      };
    }
    return null;
  }

  // Health endpoints
  async getDashboardHealth(): Promise<HealthApiResponse<ExternalServicesHealth>> {
    const authError = this.checkAuth<ExternalServicesHealth>();
    if (authError) return authError;

    return this.makeRequest<ExternalServicesHealth>("/admin/dashboard/health", {
      method: "GET",
    });
  }

  async getAdminHealth(): Promise<HealthApiResponse<AdminPanelHealth>> {
    const authError = this.checkAuth<AdminPanelHealth>();
    if (authError) return authError;

    return this.makeRequest<AdminPanelHealth>("/admin/health", {
      method: "GET",
    });
  }
}

