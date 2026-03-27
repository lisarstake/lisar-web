/**
 * Virtual Account API Types
 * Defines interfaces for virtual-account-related API operations
 */

import { env } from "@/lib/env";

// Base API Response
export interface VirtualAccountApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

export interface CreateVirtualAccountRequest {
  firstName: string;
  lastName: string;
}

export interface VirtualAccountDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  accountRef: string;
  currency?: string;
  status?: string;
  createdAt?: string;
}

export interface NairaBalance {
  available_balance: number;
  pending_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_converted: number;
}

export interface SupportedBank {
  bankCode: string;
  bankName: string;
}

export interface BankAccountLookupRequest {
  accountNumber: string;
  bankCode: string;
}

export interface BankAccountLookupResponse {
  accountNumber: string;
  accountName: string;
}

export interface WithdrawRequest {
  amount: number;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  narration: string;
  idempotencyKey: string;
}

export interface WithdrawResponse {
  reference: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: string;
}

export type VirtualAccountTransactionType =
  | "deposit"
  | "withdrawal"
  | "conversion_out"
  | "conversion_in"
  | "fee"
  | "refund";

export type VirtualAccountTransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface VirtualAccountTransaction {
  id: string;
  type: VirtualAccountTransactionType;
  amount: number;
  fee: number;
  netAmount: number;
  reference: string;
  status: string;
  narration: string;
  createdAt: string;
}

export interface TransactionHistoryQuery {
  limit?: number;
  offset?: number;
  type?: VirtualAccountTransactionType;
  status?: VirtualAccountTransactionStatus;
  startDate?: string;
  endDate?: string;
}

export interface TransactionHistoryResponse {
  transactions: VirtualAccountTransaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface TransactionDetails {
  id: string;
  type: string;
  amount: number;
  fee: number;
  netAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  externalReference: string;
  status: string;
  failureReason: string;
  narration: string;
  senderName: string;
  recipientName: string;
  createdAt: string;
  completedAt: string;
}

// Configuration
export interface VirtualAccountConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const VIRTUAL_ACCOUNT_CONFIG: VirtualAccountConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};
