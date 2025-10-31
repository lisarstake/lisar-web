/**
 * Admin Authentication API Service
 */

import {
  AuthApiResponse,
  CreateAdminRequest,
  CreateAdminResponse,
  LoginAdminRequest,
  LoginAdminResponse,
  AdminUser,
  AUTH_CONFIG,
} from "./types";

export class AuthService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = AUTH_CONFIG.baseUrl;
    this.timeout = AUTH_CONFIG.timeout;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AuthApiResponse<T>> {
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
      // some admin endpoints are not wrapped in {data}
      data: (data.data as T) ?? (data as T),
      error: response.ok ? undefined : data.error,
    } as AuthApiResponse<T>;
  }

  // Token helpers
  private getStoredToken(): string | null {
    return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
  }

  private setStoredToken(token: string, remember = false): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("auth_token", token);
  }

  removeStoredTokens(): void {
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
  }

  // Admin endpoints
  async createAdmin(request: CreateAdminRequest): Promise<AuthApiResponse<CreateAdminResponse>> {
    return this.makeRequest<CreateAdminResponse>("/admin/create", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async login(request: LoginAdminRequest, remember = false): Promise<AuthApiResponse<LoginAdminResponse>> {
    const result = await this.makeRequest<LoginAdminResponse>("/admin/login", {
      method: "POST",
      body: JSON.stringify(request),
    });

    // Store token if present (either in result.data.token or top-level token)
    const token = (result as any).data?.token ?? (result as any).token;
    if (result.success && token) {
      this.setStoredToken(token, remember);
    }

    return result;
  }

  // Get current admin info from /admin/me endpoint
  async getCurrentUser(): Promise<AuthApiResponse<AdminUser>> {
    const token = this.getStoredToken();
    if (!token) {
      return { success: false, message: "Not authenticated", data: null as unknown as AdminUser };
    }

    return this.makeRequest<AdminUser>("/admin/me", {
      method: "GET",
    });
  }

  async logout(): Promise<void> {
    this.removeStoredTokens();
  }
}

