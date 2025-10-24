/**
 * Authentication API Service
 * Real implementation for Lisar API v1
 */

import { IAuthApiService } from './api';
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
  AUTH_CONFIG
} from './types';

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
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = this.getStoredToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
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
          message: data.message || 'An error occurred',
          data: null as T,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        message: data.message || 'Success',
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Token management helpers
  private getStoredToken(): string | null {
    // Check localStorage first (remembered sessions)
    let token = localStorage.getItem('auth_token');
    
    // Check if token has expired (if rememberMe was used)
    const expiry = localStorage.getItem('auth_expiry');
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
      token = sessionStorage.getItem('auth_token');
    }
    
    return token;
  }

  private setStoredToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private getStoredRefreshToken(): string | null {
    // Check localStorage first
    let refreshToken = localStorage.getItem('refresh_token');
    
    // If not in localStorage, check sessionStorage
    if (!refreshToken) {
      refreshToken = sessionStorage.getItem('refresh_token');
    }
    
    return refreshToken;
  }

  private setStoredRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  private removeStoredTokens(): void {
    // Clear from both storages
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_expiry');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');
  }

  // Authentication Methods
  async createWallet(request: CreateWalletRequest): Promise<AuthApiResponse<CreateWalletResponse>> {
    return this.makeRequest<CreateWalletResponse>('/users/create-with-wallet', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async signup(request: SignupRequest): Promise<AuthApiResponse<SignupResponse>> {
    return this.makeRequest<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async signin(request: LoginRequest): Promise<AuthApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Google OAuth Methods
  async initiateGoogleAuth(): Promise<AuthApiResponse<{ url: string }>> {
    try {
      const response = await this.makeRequest<{ url: string }>('/auth/google', {
        method: 'GET',
      });
      
      if (response.success && response.data?.url) {
        // Redirect to the Google OAuth URL
        window.location.href = response.data.url;
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to initiate Google OAuth',
        data: null as unknown as { url: string },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async handleGoogleCallback(): Promise<AuthApiResponse<GoogleOAuthResponse>> {
    try {
      // Extract the callback URL from the current page URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (!code) {
        return {
          success: false,
          message: 'No authorization code found in callback URL',
          data: null as unknown as GoogleOAuthResponse,
          error: 'Missing authorization code',
        };
      }

      // Make request to callback endpoint with the authorization code as a query parameter
      return this.makeRequest<GoogleOAuthResponse>(`/auth/google/callback?code=${code}&state=${state || ''}`, {
        method: 'GET',
      });
    } catch (error) {
      return {
        success: false,
        message: 'Failed to handle Google OAuth callback',
        data: null as unknown as GoogleOAuthResponse,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async logout(request?: LogoutRequest): Promise<AuthApiResponse<LogoutResponse>> {
    try {
      // Call the signout endpoint
      const response = await this.makeRequest<LogoutResponse>('/auth/signout', {
        method: 'POST',
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
        message: 'Logged out successfully',
        data: { message: 'Logged out successfully', success: true },
      };
    }
  }

  // Password Management
  async forgotPassword(request: ForgotPasswordRequest): Promise<AuthApiResponse<ForgotPasswordResponse>> {
    return this.makeRequest<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async resetPassword(request: ResetPasswordRequest): Promise<AuthApiResponse<ResetPasswordResponse>> {
    return this.makeRequest<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async changePassword(request: ChangePasswordRequest): Promise<AuthApiResponse<ChangePasswordResponse>> {
    return this.makeRequest<ChangePasswordResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }


  async resendVerificationEmail(email: string): Promise<AuthApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Token Management
  async refreshToken(request: RefreshTokenRequest): Promise<AuthApiResponse<RefreshTokenResponse>> {
    return this.makeRequest<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async validateToken(token: string): Promise<AuthApiResponse<{ valid: boolean; user?: User }>> {
    return this.makeRequest<{ valid: boolean; user?: User }>('/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // User Profile
  async getCurrentUser(): Promise<AuthApiResponse<User>> {
    return this.makeRequest<User>('/auth/me');
  }

  async updateProfile(request: UpdateProfileRequest): Promise<AuthApiResponse<User>> {
    // Get the current user ID from the stored token or make a request to get it
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found',
        data: null as unknown as User,
        error: 'Authentication required',
      };
    }

    // Decode the token to get user ID
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.sub;
      
      return this.makeRequest<User>(`/users/profile/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(request),
      });
    } catch (error) {
      return {
        success: false,
        message: 'Failed to decode authentication token',
        data: null as unknown as User,
        error: error instanceof Error ? error.message : 'Token decode error',
      };
    }
  }

  async deleteAccount(password: string): Promise<AuthApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  }

  // Session Management
  async getSessionInfo(): Promise<AuthApiResponse<SessionInfo>> {
    const userResponse = await this.getCurrentUser();
    if (!userResponse.success) {
      return {
        success: false,
        message: 'Failed to get session info',
        data: null as unknown as SessionInfo,
        error: userResponse.error,
      };
    }

    // Note: This might need to be adjusted based on actual API response
    return {
      success: true,
      message: 'Session info retrieved',
      data: {
        user: userResponse.data,
        wallet: {
          id: 'wallet_id',
          address: userResponse.data.user_metadata.wallet_address,
          chain_type: 'ethereum',
        },
        isActive: true,
      },
    };
  }

  async revokeAllSessions(): Promise<AuthApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/auth/revoke-all-sessions', {
      method: 'POST',
    });
  }
}
