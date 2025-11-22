/**
 * Wallet API Types
 * Defines interfaces for wallet-related API operations
 */

import { env } from '@/lib/env'

// Base API Response
export interface WalletApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Wallet Data Types
export interface WalletData {
  id: string;
  address: string;
  chain_type: string;
  policy_ids: string[];
  additional_signers: string[];
  exported_at: number | null;
  imported_at: number | null;
  created_at: number;
  owner_id: string;
}

// Balance Types
export interface BalanceData {
  balance: string;
}

export interface BalanceResponse {
  success: boolean;
  balance: string;
}

// Export Types
export interface ExportData {
  privateKey: string;
}

export interface ExportResponse {
  success: boolean;
  privateKey: string;
}

// Send LPT Types
export interface SendLptRequest {
  walletId: string;
  walletAddress: string;
  to: string;
  amount: string;
}

export interface SendLptResponse {
  success: boolean;
  txHash?: string;
  message?: string;
  error?: string;
}

// Approve LPT Types
export interface ApproveLptRequest {
  walletId: string;
  walletAddress: string;
  spender: string;
  amount: string;
}

export interface ApproveLptResponse {
  success: boolean;
  txHash?: string;
  message?: string;
  error?: string;
}

// Request Types
export interface GetWalletRequest {
  walletId: string;
}

export interface GetBalanceRequest {
  walletAddress: string;
  token: 'ETH' | 'LPT';
}

export interface ExportWalletRequest {
  walletId: string;
}

// Configuration
export interface WalletConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const WALLET_CONFIG: WalletConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};
