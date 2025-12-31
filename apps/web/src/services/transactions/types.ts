/**
 * Transactions API Types
 * Defines interfaces for transaction-related API operations
 */

import { env } from '@/lib/env'

// Base API Response
export interface TransactionApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
}

// Transaction Types
export type TransactionType = 'deposit' | 'withdrawal' | 'delegation' | 'undelegation' | 'mint' | 'burn';

// Transaction Data
export interface TransactionData {
  id: string;
  user_id: string;
  transaction_hash: string;
  transaction_type: TransactionType;
  amount: string;
  token_address: string;
  token_symbol: string;
  wallet_address: string;
  wallet_id: string;
  status: 'pending' | 'confirmed' | 'failed';
  source: string;
  svix_id: string;
  created_at: string;
}

// API Response for transaction list
export interface TransactionListResponse {
  success: boolean;
  data: TransactionData[];
  count: number;
}

// API Response for single transaction
export interface TransactionDetailResponse {
  success: boolean;
  data: TransactionData;
}

// Request types
export interface GetUserTransactionsRequest {
  userId: string;
}

export interface GetTransactionByIdRequest {
  transactionId: string;
}

export interface GetUserTransactionsByTypeRequest {
  userId: string;
  type: TransactionType;
}

// Create transaction request
export interface CreateTransactionRequest {
  user_id: string;
  transaction_hash: string;
  transaction_type: TransactionType;
  amount: string;
  token_address: string;
  token_symbol: string;
  wallet_address: string;
  wallet_id: string;
  status: 'pending' | 'confirmed' | 'failed';
  source: string;
}

// Update transaction status request
export interface UpdateTransactionStatusRequest {
  status: 'pending' | 'confirmed' | 'failed';
}

// API Response for create transaction
export interface CreateTransactionResponse {
  success: boolean;
  data: TransactionData;
}

// API Response for update transaction status
export interface UpdateTransactionStatusResponse {
  success: boolean;
  data: TransactionData;
}

// Configuration
export interface TransactionConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const TRANSACTION_CONFIG: TransactionConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};
