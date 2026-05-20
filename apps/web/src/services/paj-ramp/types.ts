/**
 * PAJ Ramp API Types
 * Defines interfaces for paj-ramp-related API operations
 */

import { env } from "@/lib/env";

// Base API Response
export interface PajRampApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
  };
}

export interface SessionInitiateData {
  email: string;
  phone: string;
}

export interface DeviceInfo {
  uuid: string;
  device: string;
  os: string;
  browser: string;
}

export interface SessionVerifyRequest {
  otp: string;
}

export interface SessionVerifyData {
  expiresAt: string;
  hasActiveSession: boolean;
}

export interface SessionStatusData {
  hasActiveSession: boolean;
}

export interface RateInfo {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  isActive?: boolean;
}

export interface RatesData {
  onRampRate: RateInfo;
  offRampRate: RateInfo;
}

export interface AmountRateData {
  rate: {
    baseCurrency: string;
    targetCurrency: string;
    rate: number;
  };
  amounts: {
    userTax: number;
    merchantTax: number;
    amountUSD: number;
    userAmountFiat: number;
  };
}

export interface CreateOnRampOrderRequest {
  fiatAmount: number;
  currency: string;
  recipient: string;
  mint: string;
  chain: string;
}

export interface OnRampOrderData {
  orderId: string;
  accountNumber: string;
  accountName: string;
  fiatAmount: number;
  bank: string;
}

export interface RampBank {
  id: string;
  code: string;
  name: string;
  logo: string;
  country: string;
}

export interface ResolveBankAccountRequest {
  bankId: string;
  accountNumber: string;
}

export interface ResolveBankAccountData {
  accountName: string;
  accountNumber: string;
  bank: Record<string, unknown>;
}

export interface AddBankAccountRequest {
  bankId: string;
  accountNumber: string;
}

export interface SavedBankAccount {
  id?: string;
  bankId?: string;
  accountName?: string;
  accountNumber: string;
  bank?: Record<string, unknown>;
}

export interface CreateOffRampOrderRequest {
  bank: string;
  accountNumber: string;
  currency: string;
  amount: number;
  fiatAmount: number;
  mint: string;
  chain: string;
}

export interface OffRampOrderData {
  orderId: string;
  address: string;
  amount: number;
  fiatAmount: number;
  rate: number;
  fee: number;
  mint: string;
}

export type RampTransactionStatus =
  | "INIT"
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | string;

export type RampTransactionType = "ON_RAMP" | "OFF_RAMP" | string;

export interface RampTransaction {
  id: string;
  address: string;
  signature: string;
  mint: string;
  currency: string;
  amount: number;
  usdcAmount: number;
  fiatAmount: number;
  sender: string;
  recipient: string;
  rate: number;
  status: RampTransactionStatus;
  transactionType: RampTransactionType;
  createdAt: string;
}

// Configuration
export interface PajRampConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const PAJ_RAMP_CONFIG: PajRampConfig = {
  baseUrl: env.VITE_PAJ_RAMP_API_BASE_URL || env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};
