/**
 * Admin Gas Topup API Types
 */

import { env } from '@/lib/env';

// Base API Response
export interface GasApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Gas Topup Request
export interface GasTopupRequest {
  amount: string;
}

// Gas Topup Response
export interface GasTopupResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// API Configuration
export interface GasConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const GAS_CONFIG: GasConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};

