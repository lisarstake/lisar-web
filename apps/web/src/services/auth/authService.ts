/**
 * Authentication API Service
 * Real implementation for Lisar API v1
 */

import { IAuthApiService } from "./api";
import {
  AuthApiResponse,
  CreateWalletRequest,
  CreateWalletResponse,
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  GoogleOAuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePasswordResponse, 
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse,
  User,
  SessionInfo,
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
    options: RequestInit = {}
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

  private setStoredToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  private getStoredRefreshToken(): string | null {
    // Check localStorage first
    let refreshToken = localStorage.getItem("refresh_token");

    // If not in localStorage, check sessionStorage
    if (!refreshToken) {
      refreshToken = sessionStorage.getItem("refresh_token");
    }

    return refreshToken;
  }

  private setStoredRefreshToken(token: string): void {
    localStorage.setItem("refresh_token", token);
  }

  private removeStoredTokens(): void {
    // Clear from both storages
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_expiry");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("refresh_token");
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
        // Redirect to the Google OAuth URL
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
      // Extract tokens from URL hash OR from localStorage if already stored
      const hash = window.location.hash.substring(1);
      
      let access_token: string | null = null;
      let refresh_token: string | null = null;
      let expires_at: string | null = null;
      let expires_in: string | null = null;
      let provider_token: string | null = null;

      if (hash.length > 0) {
        // Extract from hash
        const params = new URLSearchParams(hash);
        access_token = params.get('access_token');
        refresh_token = params.get('refresh_token');
        expires_at = params.get('expires_at');
        expires_in = params.get('expires_in');
        provider_token = params.get('provider_token');
      } else {
        // Hash is empty, try to read from localStorage (already stored by LoginForm)
        access_token = localStorage.getItem("auth_token");
        refresh_token = localStorage.getItem("refresh_token");
        expires_at = localStorage.getItem("auth_expiry");
      }

      if (!access_token || !refresh_token) {
        return {
          success: false,
          message: "Missing tokens in Google OAuth response",
          data: null as unknown as GoogleOAuthResponse,
          error: "Missing tokens",
        };
      }

      // Store tokens in localStorage if we got them from hash
      if (hash.length > 0) {
        localStorage.setItem("auth_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        
        if (expires_at) {
          localStorage.setItem("auth_expiry", expires_at);
        }
      }

      // Decode JWT to get user info
      try {
        const tokenParts = access_token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        
        // Extract user info from token
        const user: any = {
          id: payload.sub,
          email: payload.email,
          email_confirmed_at: payload.email_confirmed_at,
          user_metadata: payload.user_metadata || {},
          created_at: new Date(payload.iat * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
        };

        // Create session object
        const session = {
          access_token,
          refresh_token,
          expires_in: expires_in ? parseInt(expires_in) : 3600,
          expires_at: expires_at ? parseInt(expires_at) : Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
        };

        // Create wallet object from user metadata
        const wallet = {
          wallet_id: payload.user_metadata?.wallet_id || '',
          wallet_address: payload.user_metadata?.wallet_address || '',
          privy_user_id: payload.user_metadata?.privy_user_id || '',
        };

        // Log user data to check wallet creation
        console.log("[Google OAuth] User Data:", {
          userId: user.id,
          email: user.email,
          userMetadata: payload.user_metadata,
          wallet: {
            wallet_id: wallet.wallet_id,
            wallet_address: wallet.wallet_address,
            privy_user_id: wallet.privy_user_id,
            hasWallet: !!(wallet.wallet_id && wallet.wallet_address),
          },
        });

        const response: GoogleOAuthResponse = {
          success: true,
          message: "Google OAuth successful",
          user,
          session,
          wallet,
        };

        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);

        return {
          success: true,
          message: "Google OAuth successful",
          data: response,
        };
      } catch (decodeError) {
        return {
          success: false,
          message: "Failed to decode token",
          data: null as unknown as GoogleOAuthResponse,
          error: decodeError instanceof Error ? decodeError.message : "Token decode error",
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
      // Call the signout endpoint
      const response = await this.makeRequest<LogoutResponse>("/auth/signout", {
        method: "POST",
        body: JSON.stringify(request || {}),
      });

      // Always remove tokens locally regardless of API response
      this.removeStoredTokens();

      return response;
    } catch (error) {
      // Even if API call fails, remove tokens locally
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

    // Decode the token to get user ID
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
    // Get the current user ID from the stored token or make a request to get it
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "No authentication token found",
        data: null as unknown as User,
        error: "Authentication required",
      };
    }

    // Decode the token to get user ID
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

      // Upload to Cloudinary
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
    try {
      const response = await this.makeRequest<RefreshTokenResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: request.refreshToken }),
      });

      if (response.success && response.data) {
        // Update stored tokens
        const storage = localStorage.getItem("auth_token") ? localStorage : sessionStorage;
        storage.setItem("auth_token", response.data.access_token);
        storage.setItem("refresh_token", response.data.refresh_token);
        
        if (response.data.expires_at) {
          storage.setItem("auth_expiry", response.data.expires_at.toString());
        }
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: "Failed to refresh token",
        data: null as unknown as RefreshTokenResponse,
        error: error instanceof Error ? error.message : "Token refresh failed",
      };
    }
  }
}
