/**
 * Admin Authentication API Types
 */

// Base API Response
export interface AuthApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Admin Models
export interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

// Requests
export interface CreateAdminRequest {
  email: string;
  password: string;
  role: string;
}

export interface LoginAdminRequest {
  email: string;
  password: string;
}

// Responses
export interface CreateAdminResponse extends AdminUser {}

export interface LoginAdminResponse {
  success: boolean;
  token: string;
}

// Token Management
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  expiresIn: number;
}

export interface RevokeTokenRequest {
  refreshToken: string;
}

export interface RevokeTokenResponse {
  success: boolean;
  message: string;
}

// Password Reset
export interface PasswordResetRequestRequest {
  email: string;
}

export interface PasswordResetRequestResponse {
  success: boolean;
  message: string;
}

export interface PasswordResetVerifyRequest {
  token: string;
}

export interface PasswordResetVerifyResponse {
  success: boolean;
  message: string;
  email: string;
}

export interface PasswordResetResetRequest {
  token: string;
  newPassword: string;
}

export interface PasswordResetResetResponse {
  success: boolean;
  message: string;
}

// API Configuration
export interface AuthConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const AUTH_CONFIG: AuthConfig = {
  baseUrl: "https://lisar-api-1.onrender.com/api/v1",
  timeout: 30000,
  retryAttempts: 3,
};
