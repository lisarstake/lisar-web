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
  RefreshTokenRequest,
  RefreshTokenResponse,
  RevokeTokenRequest,
  RevokeTokenResponse,
  PasswordResetRequestRequest,
  PasswordResetRequestResponse,
  PasswordResetVerifyRequest,
  PasswordResetVerifyResponse,
  PasswordResetResetRequest,
  PasswordResetResetResponse,
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

    if (response.status === 401) {
      const isPublicEndpoint =
        endpoint.includes("/login") ||
        endpoint.includes("/signup") ||
        endpoint.includes("/password-reset") ||
        endpoint.includes("/create");

      if (!isPublicEndpoint) {
        this.removeStoredTokens();
      }
    }

    return {
      success: response.ok,
      message: data.message,
      data: (data.data as T) ?? (data as T),
      error: response.ok ? undefined : data.error,
    } as AuthApiResponse<T>;
  }

  // Token helpers
  private getStoredToken(): string | null {
    return (
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  }

  private getStoredRefreshToken(): string | null {
    return (
      localStorage.getItem("refresh_token") ||
      sessionStorage.getItem("refresh_token")
    );
  }

  private setStoredToken(token: string, remember = false): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("auth_token", token);
  }

  removeStoredTokens(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("refresh_token");
  }

  // Admin endpoints
  async createAdmin(
    request: CreateAdminRequest
  ): Promise<AuthApiResponse<CreateAdminResponse>> {
    return this.makeRequest<CreateAdminResponse>("/admin/create", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async login(
    request: LoginAdminRequest,
    remember = false
  ): Promise<AuthApiResponse<LoginAdminResponse>> {
    const result = await this.makeRequest<LoginAdminResponse>("/admin/login", {
      method: "POST",
      body: JSON.stringify(request),
    });

    // Store tokens if present
    const accessToken = result.data?.accessToken;
    const refreshToken = result.data?.refreshToken;
    
    if (result.success && accessToken) {
      // Store access token
      this.setStoredToken(accessToken, remember);
      
      // Store refresh token
      const storage = remember ? localStorage : sessionStorage;
      if (refreshToken) {
        storage.setItem("refresh_token", refreshToken);
      }
    }

    return result;
  }

  // Get current admin info from /admin/me endpoint
  async getCurrentUser(): Promise<AuthApiResponse<AdminUser>> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "Not authenticated",
        data: null as unknown as AdminUser,
        error: "No authentication token found",
      };
    }

    return this.makeRequest<AdminUser>("/admin/me", {
      method: "GET",
    });
  }

  async logout(): Promise<void> {
    const refreshToken = this.getStoredRefreshToken();

    // Only attempt to revoke token if refresh token exists
    if (refreshToken) {
      try {
        await this.revokeToken({ refreshToken });
      } catch (error) {
        // Silently fail - we'll clear tokens anyway
        console.error("Failed to revoke token:", error);
      }
    }

    // Always clear stored tokens
    this.removeStoredTokens();
  }

  // Token Management
  async refreshToken(
    request: RefreshTokenRequest
  ): Promise<AuthApiResponse<RefreshTokenResponse>> {
    // Check if refresh token exists
    if (!request.refreshToken) {
      return {
        success: false,
        message: "No refresh token provided",
        data: null as unknown as RefreshTokenResponse,
        error: "Missing refresh token",
      };
    }

    const result = await this.makeRequest<RefreshTokenResponse>(
      "/admin/refresh",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    // Update stored token if refresh was successful
    if (result.success && result.data?.accessToken) {
      // Determine which storage to use (check if token exists in localStorage)
      const storage = localStorage.getItem("auth_token")
        ? localStorage
        : sessionStorage;
      storage.setItem("auth_token", result.data.accessToken);
    }

    return result;
  }

  async revokeToken(
    request: RevokeTokenRequest
  ): Promise<AuthApiResponse<RevokeTokenResponse>> {
    // Check if refresh token exists
    if (!request.refreshToken) {
      return {
        success: false,
        message: "No refresh token provided",
        data: null as unknown as RevokeTokenResponse,
        error: "Missing refresh token",
      };
    }

    const result = await this.makeRequest<RevokeTokenResponse>(
      "/admin/revoke",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );

    // Clear stored tokens if revoke was successful
    if (result.success) {
      this.removeStoredTokens();
    }

    return result;
  }

  // Password Reset
  async requestPasswordReset(
    request: PasswordResetRequestRequest
  ): Promise<AuthApiResponse<PasswordResetRequestResponse>> {
    return this.makeRequest<PasswordResetRequestResponse>(
      "/admin/password-reset/request",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  async verifyPasswordResetToken(
    request: PasswordResetVerifyRequest
  ): Promise<AuthApiResponse<PasswordResetVerifyResponse>> {
    return this.makeRequest<PasswordResetVerifyResponse>(
      "/admin/password-reset/verify",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  async resetPassword(
    request: PasswordResetResetRequest
  ): Promise<AuthApiResponse<PasswordResetResetResponse>> {
    return this.makeRequest<PasswordResetResetResponse>(
      "/admin/password-reset/reset",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }
}
