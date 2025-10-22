/**
 * Authentication API Types
 * Defines interfaces for auth-related API requests and responses
 * Based on Lisar API v1: https://api.lisar.io/v1
 */

// Base API Response
export interface AuthApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// User Authentication Types
export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface SignupResponse {
  user: User;
  privy_user_id: string;
  wallet: Wallet;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  privy_user_id: string;
  wallet: Wallet;
  token?: string; // If JWT is returned
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

// User Profile Types (based on API response)
export interface User {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  user_metadata: UserMetadata;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
}

export interface UserMetadata {
  full_name: string;
  wallet_address: string;
}

export interface Wallet {
  id: string;
  address: string;
  chain_type: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  success: boolean;
}

// Token Management
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface LogoutResponse {
  message: string;
  success: boolean;
}

// Session Management
export interface SessionInfo {
  user: User;
  wallet: Wallet;
  isActive: boolean;
}

// Error Types
export interface AuthError {
  code: string;
  message: string;
  field?: string; // For field-specific validation errors
}

// API Configuration
export interface AuthConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

// Constants
export const AUTH_CONFIG: AuthConfig = {
  baseUrl: 'https://api.lisar.io/v1',
  timeout: 10000,
  retryAttempts: 3
};