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

// Wallet Response Types (for new endpoints)
export interface Wallet {
  id: string;
  user_id: string;
  wallet_id: string;
  wallet_address: string;
  chain_type: string;
  wallet_type: string;
  is_primary: boolean;
  wallet_index: number | null;
  public_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface GetWalletsResponse {
  success: boolean;
  wallets: Wallet[];
  error?: string;
}

export interface GetPrimaryWalletResponse {
  success: boolean;
  wallet?: Wallet;
  error?: string;
}

export interface CreateSolanaWalletRequest {
  make_primary: boolean;
}

export interface CreateSolanaWalletResponse {
  success: boolean;
  wallet?: Wallet;
  error?: string;
}

// Chain Types
export type ChainType = 'ethereum' | 'solana' | 'polygon' | 'arbitrum' | 'base' | 'optimism';

// Balance Types
export interface BalanceData {
  // Human‑readable balance (e.g. "211.667977")
  balance: string;
  // Raw balance in smallest units (e.g. wei/lamports) as a string
  balanceRaw?: string;
  // Number of decimals for the token (e.g. 6 for USDC/USDT)
  decimals?: number;
  // Token symbol, e.g. "USDT", "USDC", "ETH", "LPT"
  symbol?: string;
  // Chain ID for the balance (e.g. 1 for Ethereum, 42161 for Arbitrum)
  chainId?: number;
}

export interface BalanceResponse extends BalanceData {
  success: boolean;
  error?: string;
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
  token: 'ETH' | 'LPT' | 'USDC' | 'USDT';
  chainId?: 1 | 42161;
}

// Solana Balance Types
export interface SolanaBalanceRequest {
  walletAddress: string;
  token: 'SOL' | 'USDC' | 'USDT' | 'USD*' | 'ALL';
}

export interface SolanaTokenBalance {
  balance: string;
  balanceLamports?: string; 
  decimals?: number; 
  tokenAccount?: string;
}

export interface SolanaBalances {
  sol?: SolanaTokenBalance;
  usdc?: SolanaTokenBalance;
  usdt?: SolanaTokenBalance;
  'usd*'?: SolanaTokenBalance;
}

export interface SolanaBalanceResponse {
  success: boolean;
  balances?: SolanaBalances;
  error?: string;
}

export interface ExportWalletRequest {
  walletId: string;
}

// Solana Send Types
export interface SolanaSendRequest {
  walletId: string;
  fromAddress: string;
  toAddress: string;
  token: 'SOL' | 'USDC' | 'USDT';
  amount: number;
}

export interface SolanaSendResponse {
  success: boolean;
  txHash?: string;
  error?: string;
}

// Token Approve Types (with chainId)
export interface ApproveTokenRequest {
  walletId: string;
  walletAddress: string;
  amount: string;
}

export interface ApproveTokenResponse {
  success: boolean;
  txHash?: string;
  spender?: string;
  amount?: string;
  chainId?: number;
  error?: string;
}

// Token Send Types (with chainId)
export interface SendTokenRequest {
  walletId: string;
  walletAddress: string;
  to: string;
  amount: string;
}

export interface SendTokenResponse {
  success: boolean;
  txHash?: string;
  to?: string;
  amount?: string;
  chainId?: number;
  error?: string;
}

// Spender Types
export interface Spender {
  key: string;
  address: string;
  name: string;
  description: string;
  category: string;
  tokens?: string[];
}

export interface GetSpendersResponse {
  success: boolean;
  chainId: number;
  token?: string;
  count: number;
  spenders: Spender[];
  error?: string;
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
