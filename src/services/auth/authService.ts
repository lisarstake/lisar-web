/**
 * Authentication API Service
 * Real implementation for Lisar API v1
 */

import {
  IAuthApiService,
  AuthApiResponse,
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
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
    
    const defaultHeaders = {
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
    return localStorage.getItem('auth_token');
  }

  private setStoredToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private removeStoredToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Authentication Methods
  async signup(request: SignupRequest): Promise<AuthApiResponse<SignupResponse>> {
    return this.makeRequest<SignupResponse>('/users/create-with-wallet', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async login(request: LoginRequest): Promise<AuthApiResponse<LoginResponse>> {
    // Note: This endpoint might need to be confirmed with the API documentation
    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async logout(request?: LogoutRequest): Promise<AuthApiResponse<LogoutResponse>> {
    this.removeStoredToken();
    
    // If there's a logout endpoint, call it
    if (request?.refreshToken) {
      return this.makeRequest<LogoutResponse>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    }

    return {
      success: true,
      message: 'Logged out successfully',
      data: { message: 'Logged out successfully', success: true },
    };
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

  // Email Verification
  async verifyEmail(request: { token: string }): Promise<AuthApiResponse<{ message: string; success: boolean }>> {
    return this.makeRequest<{ message: string; success: boolean }>('/auth/verify-email', {
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
    return this.makeRequest<User>('/users/me');
  }

  async updateProfile(request: UpdateProfileRequest): Promise<AuthApiResponse<User>> {
    return this.makeRequest<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
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
        data: null as SessionInfo,
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
