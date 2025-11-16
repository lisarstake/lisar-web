/**
 * Authentication API Service
 * Real implementation for Lisar API v1
 */

import { IAuthApiService } from "./api";
import {
  AuthApiResponse,
  CreateWalletRequest,
  CreateWalletResponse,
  LoginRequest,
  LoginResponse,
  GoogleOAuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdateProfileRequest,
  UpdateOnboardingStatusRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse,
  User,
  AUTH_CONFIG,
} from "./types";

export class AuthService implements IAuthApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = AUTH_CONFIG.baseUrl;
    this.timeout = AUTH_CONFIG.timeout;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn401: boolean = true
  ): Promise<AuthApiResponse<T>> {
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

      // Handle 401 Unauthorized - Try to refresh token
      if (response.status === 401 && retryOn401) {
        const isPublicEndpoint =
          endpoint.includes("/signin") ||
          endpoint.includes("/create") ||
          endpoint.includes("/google") ||
          endpoint.includes("/forgot-password") ||
          endpoint.includes("/reset-password") ||
          endpoint.includes("/refresh");

        if (!isPublicEndpoint) {
          const refreshToken = this.getStoredRefreshToken();
          if (refreshToken) {
            try {
              const refreshResult = await this.refreshToken({ refreshToken });
              if (refreshResult.success && refreshResult.data?.access_token) {
                return this.makeRequest<T>(endpoint, options, false);
              }
            } catch (error) {
              console.error("Token refresh failed during API call:", error);
            }
          }
          this.removeStoredTokens();
        }
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
        message: data.message || "Success",
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

  // Sign up and create a wallet
  async createWallet(
    request: CreateWalletRequest
  ): Promise<AuthApiResponse<CreateWalletResponse>> {
    return this.makeRequest<CreateWalletResponse>("/users/create-with-wallet", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async signin(request: LoginRequest): Promise<AuthApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Google OAuth Methods
  async initiateGoogleAuth(): Promise<AuthApiResponse<{ url: string }>> {
    try {
      const response = await this.makeRequest<{ url: string }>("/auth/google", {
        method: "GET",
      });

      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: "Failed to initiate Google OAuth",
        data: null as unknown as { url: string },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async handleGoogleCallback(): Promise<AuthApiResponse<GoogleOAuthResponse>> {
    try {
      const hash = window.location.hash.substring(1);

      let access_token: string | null = null;
      let refresh_token: string | null = null;
      let expires_at: string | null = null;
      let expires_in: string | null = null;
      let provider_token: string | null = null;

      if (hash.length > 0) {
        // Extract from hash
        const params = new URLSearchParams(hash);
        access_token = params.get("access_token");
        refresh_token = params.get("refresh_token");
        expires_at = params.get("expires_at");
        expires_in = params.get("expires_in");
        provider_token = params.get("provider_token");
      } else {
        access_token = localStorage.getItem("auth_token");
        refresh_token = localStorage.getItem("refresh_token");
        expires_at = localStorage.getItem("auth_expiry");
      }

      if (!access_token) {
        return {
          success: false,
          message: "Missing access token in Google OAuth response",
          data: null as unknown as GoogleOAuthResponse,
          error: "Missing access token",
        };
      }

      try {
        const queryParams = new URLSearchParams({
          code: access_token,
          ...(refresh_token && { refresh_token: refresh_token }),
        });

        const apiResponse = await this.makeRequest<GoogleOAuthResponse>(
          `/auth/google/callback?${queryParams.toString()}`,
          {
            method: "GET",
          }
        );

        if (apiResponse.success && apiResponse.data) {
          // Store tokens from API response
          const { session } = apiResponse.data;
          if (session?.access_token && session?.refresh_token) {
            localStorage.setItem("auth_token", session.access_token);
            localStorage.setItem("refresh_token", session.refresh_token);

            if (session.expires_at) {
              localStorage.setItem(
                "auth_expiry",
                session.expires_at.toString()
              );
            }
          }

          // Clear the hash from URL
          window.history.replaceState(null, "", window.location.pathname);

          return apiResponse;
        } else {
          return {
            success: false,
            message:
              apiResponse.message || "Failed to process Google OAuth callback",
            data: null as unknown as GoogleOAuthResponse,
            error: apiResponse.error || "API error",
          };
        }
      } catch (apiError) {
        return {
          success: false,
          message: "Failed to call Google OAuth callback API",
          data: null as unknown as GoogleOAuthResponse,
          error:
            apiError instanceof Error ? apiError.message : "API call failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to handle Google OAuth callback",
        data: null as unknown as GoogleOAuthResponse,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async logout(
    request?: LogoutRequest
  ): Promise<AuthApiResponse<LogoutResponse>> {
    try {
      const response = await this.makeRequest<LogoutResponse>("/auth/signout", {
        method: "POST",
        body: JSON.stringify(request || {}),
      });

      this.removeStoredTokens();

      return response;
    } catch (error) {
      this.removeStoredTokens();
      return {
        success: true,
        message: "Logged out successfully",
        data: { message: "Logged out successfully", success: true },
      };
    }
  }

  // Password Management
  async forgotPassword(
    request: ForgotPasswordRequest
  ): Promise<AuthApiResponse<ForgotPasswordResponse>> {
    return this.makeRequest<ForgotPasswordResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async resetPassword(
    request: ResetPasswordRequest
  ): Promise<AuthApiResponse<ResetPasswordResponse>> {
    return this.makeRequest<ResetPasswordResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // User Profile
  async getCurrentUser(): Promise<AuthApiResponse<User>> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "No authentication token found",
        data: null as unknown as User,
        error: "Authentication required",
      };
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const userId = tokenPayload.sub;

      return this.makeRequest<User>(`/users/profile/${userId}`, {
        method: "GET",
      });
    } catch (error) {
      return {
        success: false,
        message: "Failed to decode authentication token",
        data: null as unknown as User,
        error: error instanceof Error ? error.message : "Token decode error",
      };
    }
  }

  async updateProfile(
    request: UpdateProfileRequest
  ): Promise<AuthApiResponse<User>> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "No authentication token found",
        data: null as unknown as User,
        error: "Authentication required",
      };
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      const userId = tokenPayload.sub;

      return this.makeRequest<User>(`/users/profile/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(request),
      });
    } catch (error) {
      return {
        success: false,
        message: "Failed to decode authentication token",
        data: null as unknown as User,
        error: error instanceof Error ? error.message : "Token decode error",
      };
    }
  }

  async updateOnboardingStatus(
    userId: string,
    request: UpdateOnboardingStatusRequest
  ): Promise<AuthApiResponse<User>> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "No authentication token found",
        data: null as unknown as User,
        error: "Authentication required",
      };
    }

    return this.makeRequest<User>(`/users/profile/${userId}/onboard`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  // Image Upload
  async uploadProfileImage(
    file: File
  ): Promise<AuthApiResponse<{ imageUrl: string }>> {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        message: "Image size must be less than 5MB",
        data: null as unknown as { imageUrl: string },
        error: "File too large",
      };
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        message: "Please select a valid image file",
        data: null as unknown as { imageUrl: string },
        error: "Invalid file type",
      };
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "lisar_profiles");
      formData.append("folder", "lisar-profiles");

      
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dgz4c3ahz/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        return {
          success: true,
          message: "Image uploaded successfully",
          data: { imageUrl: data.secure_url },
        };
      } else {
        return {
          success: false,
          message: "Failed to upload image",
          data: null as unknown as { imageUrl: string },
          error: data.error?.message || "Upload failed",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to upload image",
        data: null as unknown as { imageUrl: string },
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  // Token Refresh
  async refreshToken(
    request: RefreshTokenRequest
  ): Promise<AuthApiResponse<RefreshTokenResponse>> {
    if (!request.refreshToken) {
      return {
        success: false,
        message: "No refresh token provided",
        data: null as unknown as RefreshTokenResponse,
        error: "Missing refresh token",
      };
    }

    try {
      const response = await this.makeRequest<RefreshTokenResponse>(
        "/auth/refresh",
        {
          method: "POST",
          body: JSON.stringify({ refreshToken: request.refreshToken }),
        },
        false // Don't retry on 401 for refresh endpoint
      );

      if (response.success && response.data) {
        // Update stored tokens
        const storage = localStorage.getItem("auth_token")
          ? localStorage
          : sessionStorage;
        storage.setItem("auth_token", response.data.access_token);
        storage.setItem("refresh_token", response.data.refresh_token);

        if (response.data.expires_at) {
          storage.setItem("auth_expiry", response.data.expires_at.toString());
        }
      } else {
        // Refresh failed, clear tokens
        this.removeStoredTokens();
      }

      return response;
    } catch (error) {
      this.removeStoredTokens();
      return {
        success: false,
        message: "Failed to refresh token",
        data: null as unknown as RefreshTokenResponse,
        error: error instanceof Error ? error.message : "Token refresh failed",
      };
    }
  }
}
