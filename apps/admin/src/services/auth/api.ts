/**
 * Admin Authentication API Service Interface
 * Defines the contract for authentication-related API operations
 */

import {
  AuthApiResponse,
  CreateAdminRequest,
  CreateAdminResponse,
  LoginAdminRequest,
  LoginAdminResponse,
  AdminUser,
} from './types';

export interface IAuthApiService {
  // Authentication
  createAdmin(request: CreateAdminRequest): Promise<AuthApiResponse<CreateAdminResponse>>;
  login(request: LoginAdminRequest, remember?: boolean): Promise<AuthApiResponse<LoginAdminResponse>>;
  logout(): Promise<void>;
  
  // User Profile
  getCurrentUser(): Promise<AuthApiResponse<AdminUser>>;
}

