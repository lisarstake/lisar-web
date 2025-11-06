/**
 * Authentication API Types
 */

// Base API Response
export interface AuthApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// User Authentication Types
export interface CreateWalletRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface CreateWalletResponse {
  user: User;
  privy_user_id: string;
  wallet: Wallet;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  wallet_address: string;
}

export interface SignupResponse {
  user: User;
  session: Session;
  note?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  session: Session;
}

// Google OAuth Types
export interface GoogleOAuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  user_metadata: {
    full_name: string;
    wallet_address: string;
  };
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export interface GoogleOAuthWallet {
  wallet_id: string;
  wallet_address: string;
  privy_user_id: string;
}

export interface GoogleOAuthResponse {
  success: boolean;
  message: string;
  user: GoogleOAuthUser;
  session: Session;
  wallet: GoogleOAuthWallet;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordRequest {
  accessToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

// User Profile Types 
export interface User {
  user_id: string;
  email: string;
  full_name: string;
  wallet_address: string;
  wallet_id: string;
  chain_type: string;
  privy_user_id: string;
  img?: string;
  DOB?: string;
  country?: string;
  state?: string;
  fiat_type?: string;
  fiat_balance: number;
  lpt_balance: number;
  is_suspended: boolean;
  suspended_at?: string;
  suspension_reason?: string;
  is_onboarded?: boolean;
  created_date: string;
  updated_at: string;
}


export interface Wallet {
  id: string;
  address: string;
  chain_type: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  img?: string;
  DOB?: string;
  country?: string;
  state?: string;
  fiat_type?: string;
}

export interface UpdateOnboardingStatusRequest {
  is_onboarded: boolean;
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
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
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
  baseUrl: 'https://lisar-api-1.onrender.com/api/v1',
  timeout: 30000,
  retryAttempts: 3
};