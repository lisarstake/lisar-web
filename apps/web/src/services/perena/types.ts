/**
 * Perena API Types
 * Defines interfaces for perena-related API operations
 */

import { env } from '@/lib/env'

// Base API Response
export interface PerenaApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Price Types
export interface PriceData {
  price: number;
  token: string;
  timestamp: string;
}

export interface GetPriceResponse {
  success: boolean;
  data: PriceData;
  error?: string;
}

// Quote Types
export interface MintQuoteRequest {
  usdcAmount: number;
  yieldingMint: string;
}

export interface BurnQuoteRequest {
  usdStarAmount: number;
  yieldingMint: string;
}

export interface QuoteData {
  inputAmount: number;
  outputAmount: number;
  inputToken: string;
  outputToken: string;
  exchangeRate: number;
  fee: number;
}

export interface QuoteResponse {
  success: boolean;
  data: QuoteData;
  error?: string;
}

// Stats Types
export interface StatsData {
  usdStarPrice: number;
  environment: string;
  cluster: string;
  rpcUrl: string;
}

export interface GetStatsResponse {
  success: boolean;
  data: StatsData;
  error?: string;
}

// Mint Types
export interface MintRequest {
  walletId: string;
  walletAddress: string;
  usdcAmount: number;
}

export interface MintData {
  hash: string;
  expectedOutput: number;
  inputAmount: number;
  inputToken: string;
  outputToken: string;
}

export interface MintResponse {
  success: boolean;
  data: MintData;
  error?: string;
}

// Burn Types
export interface BurnRequest {
  walletId: string;
  walletAddress: string;
  usdStarAmount: number;
}

export interface BurnData {
  hash: string;
  expectedOutput: number;
  inputAmount: number;
  inputToken: string;
  outputToken: string;
}

export interface BurnResponse {
  success: boolean;
  data: BurnData;
  error?: string;
}

// Configuration
export interface PerenaConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const PERENA_CONFIG: PerenaConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};

