/**
 * Authentication API Service Interface
 * Defines the contract for authentication-related API operations
 */

import {
  AuthApiResponse,
  CreateWalletRequest,
  CreateWalletResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  GoogleOAuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  // VerifyEmailRequest, // Removed: not exported by './types'
  // VerifyEmailResponse, // Removed: not exported by './types'
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse,
  SessionInfo
} from './types';

export interface IAuthApiService {
  // Authentication
  createWallet(request: CreateWalletRequest): Promise<AuthApiResponse<CreateWalletResponse>>;
  signup(request: SignupRequest): Promise<AuthApiResponse<SignupResponse>>;
  signin(request: LoginRequest): Promise<AuthApiResponse<LoginResponse>>;
  logout(request?: LogoutRequest): Promise<AuthApiResponse<LogoutResponse>>;
  
  // Google OAuth
  initiateGoogleAuth(): void;
  handleGoogleCallback(): Promise<AuthApiResponse<GoogleOAuthResponse>>;
  
  // Password Management
  forgotPassword(request: ForgotPasswordRequest): Promise<AuthApiResponse<ForgotPasswordResponse>>;
  resetPassword(request: ResetPasswordRequest): Promise<AuthApiResponse<ResetPasswordResponse>>;
  changePassword(request: ChangePasswordRequest): Promise<AuthApiResponse<ChangePasswordResponse>>;
  
  // Email Verification
  resendVerificationEmail(email: string): Promise<AuthApiResponse<{ message: string }>>;
  
  // Token Management
  refreshToken(request: RefreshTokenRequest): Promise<AuthApiResponse<RefreshTokenResponse>>;
  validateToken(token: string): Promise<AuthApiResponse<{ valid: boolean; user?: User }>>;
  
  // User Profile
  getCurrentUser(): Promise<AuthApiResponse<User>>;
  updateProfile(request: UpdateProfileRequest): Promise<AuthApiResponse<User>>;
  deleteAccount(password: string): Promise<AuthApiResponse<{ message: string }>>;
  
  // Session Management
  getSessionInfo(): Promise<AuthApiResponse<SessionInfo>>;
  revokeAllSessions(): Promise<AuthApiResponse<{ message: string }>>;
}
