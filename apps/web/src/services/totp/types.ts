/**
 * TOTP (2FA) API Types
 */

import { env } from '@/lib/env';

// Base API Response
export interface TotpApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// TOTP Setup Types
export interface TotpSetupResponse {
  success: boolean;
  qr: string;
  otpauth_url: string;
}

// TOTP Verify Types
export interface TotpVerifyRequest {
  token: string;
}

export interface TotpVerifyResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// API Configuration
export interface TotpConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

// Constants
export const TOTP_CONFIG: TotpConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};

