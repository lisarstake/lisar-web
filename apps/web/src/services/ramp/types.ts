/**
 * Ramp API Types
 * Defines interfaces for ramp-related API operations
 */

import { env } from "@/lib/env";

// Base API Response
export interface RampApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
  };
}

export interface PaymentAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface BankAccount {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface BankInfo {
  name: string;
  code: string;
  nipCode: string | null;
  logo: string;
}

export interface BankLookupRequest {
  accountNumber: string;
  bankCode: string;
}

export interface AccountLookupResponse {
  accountName: string;
  accountNumber: string;
}

export interface OrderData {
  id: string;
  type: "buy" | "sell";
  status: string;
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  cryptoNetwork: string;
  cryptoAddress?: string;
  exchangeRate: number;
  paymentAccount?: PaymentAccount;
  bankAccount?: BankAccount;
  customerEmail: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface CreateBuyOrderRequest {
  fiatAmount: number;
  fiatCurrency: string;
  cryptoCurrency: string;
  cryptoNetwork: string;
  cryptoAddress: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, any>;
}

export interface CreateSellOrderRequest {
  cryptoAmount: number;
  cryptoCurrency: string;
  cryptoNetwork: string;
  fiatCurrency: string;
  bankAccountNumber: string;
  bankCode: string;
  bankAccountName: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, any>;
}

// Configuration
export interface RampConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const RAMP_CONFIG: RampConfig = {
  baseUrl: env.VITE_RAMP_API_BASE_URL, 
  timeout: 100000,
  retryAttempts: 3,
};
