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
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  User,
  UpdateProfileRequest,
  LogoutRequest,
  LogoutResponse
} from './types';

export interface IAuthApiService {
  // Authentication
  createWallet(request: CreateWalletRequest): Promise<AuthApiResponse<CreateWalletResponse>>;
  signin(request: LoginRequest): Promise<AuthApiResponse<LoginResponse>>;
  logout(request?: LogoutRequest): Promise<AuthApiResponse<LogoutResponse>>;
  
  // Google OAuth
  initiateGoogleAuth(): void;
  
  // Password Management
  forgotPassword(request: ForgotPasswordRequest): Promise<AuthApiResponse<ForgotPasswordResponse>>;
  resetPassword(request: ResetPasswordRequest): Promise<AuthApiResponse<ResetPasswordResponse>>;
  
  // User Profile
  getCurrentUser(): Promise<AuthApiResponse<User>>;
  updateProfile(request: UpdateProfileRequest): Promise<AuthApiResponse<User>>;
  
  // Image Upload
  uploadProfileImage(file: File): Promise<AuthApiResponse<{ imageUrl: string }>>;
}
