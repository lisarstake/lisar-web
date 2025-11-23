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

// Gas Topup Wallet Detail
export interface GasTopupWalletDetail {
  user_id: string;
  wallet_id: string;
  wallet_address: string;
  balanceWei: string;
  neededWei: string;
  topUpPerformed: boolean;
  txHash: string | null;
  error?: string;
}

// Gas Topup Response Data
export interface GasTopupResponseData {
  details: GasTopupWalletDetail[];
  totalChecked: number;
  totalToppedUp: number;
}

// Gas Topup Response
export interface GasTopupResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: GasTopupResponseData;
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

