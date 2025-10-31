/**
 * Admin Authentication API Types
 */

// Base API Response (some admin endpoints return flat objects, so this is optional)
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
  role: string; // typically "admin"
}

export interface LoginAdminRequest {
  email: string;
  password: string;
}

// Responses
export interface CreateAdminResponse extends AdminUser {}

export interface LoginAdminResponse {
  success: boolean;
  token: string; // JWT
}

// API Configuration
export interface AuthConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const AUTH_CONFIG: AuthConfig = {
  baseUrl: 'https://lisar-api-1.onrender.com/api/v1',
  timeout: 30000,
  retryAttempts: 3,
}

