/**
 * Authentication API Service Interface
 * Defines the contract for authentication-related API operations
 */

import {
  AuthApiResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
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
  login(request: LoginRequest): Promise<AuthApiResponse<LoginResponse>>;
  signup(request: SignupRequest): Promise<AuthApiResponse<SignupResponse>>;
  logout(request?: LogoutRequest): Promise<AuthApiResponse<LogoutResponse>>;
  
  // Password Management
  forgotPassword(request: ForgotPasswordRequest): Promise<AuthApiResponse<ForgotPasswordResponse>>;
  resetPassword(request: ResetPasswordRequest): Promise<AuthApiResponse<ResetPasswordResponse>>;
  changePassword(request: ChangePasswordRequest): Promise<AuthApiResponse<ChangePasswordResponse>>;
  
  // Email Verification
  verifyEmail(request: VerifyEmailRequest): Promise<AuthApiResponse<VerifyEmailResponse>>;
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
