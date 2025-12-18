/**
 * Maple API Types
 * Defines interfaces for maple-related API operations
 */

import { env } from '@/lib/env'

// Base API Response
export interface MapleApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Pool Types
export interface PoolAsset {
  symbol: string;
  decimals: number;
}

export interface Pool {
  id: string;
  name: string;
  asset: PoolAsset;
  syrupRouter: {
    id: string;
  };
  withdrawalManagerQueue: {
    id: string;
  };
  poolPermissionManager: {
    id: string;
  };
}

export interface GetPoolsResponse {
  success: boolean;
  data: {
    pools: Pool[];
    count: number;
  };
  error?: string;
}

export interface GetPoolResponse {
  success: boolean;
  data: Pool;
  error?: string;
}

// Authorization Types
export interface AuthorizationData {
  walletAddress: string;
  isAuthorized: boolean;
  accountExists: boolean;
  message: string;
}

export interface GetAuthorizationResponse {
  success: boolean;
  data: AuthorizationData;
  error?: string;
}

// Position Types
export interface PositionPool {
  id: string;
  name: string;
  asset: PoolAsset;
}

export interface Position {
  id: string;
  availableBalance: string;
  availableBalanceRaw: string;
  availableShares: string;
  availableSharesRaw: string;
  redeemableShares: string;
  redeemableSharesRaw: string;
  redeemRequested: boolean;
  pool: PositionPool;
}

export interface PositionsData {
  walletAddress: string;
  poolId: string;
  positions: Position[];
  hasPositions: boolean;
  message: string;
}

export interface GetPositionsResponse {
  success: boolean;
  data: PositionsData;
  error?: string;
}

// Withdrawal Queue Types
export interface WithdrawalRequest {
  id: string;
  shares: string;
  sharesRaw: string;
  status: string;
}

export interface WithdrawalQueue {
  totalShares: string;
  totalSharesRaw: string;
  nextRequest: WithdrawalRequest | null;
}

export interface WithdrawalQueueData {
  poolId: string;
  withdrawalQueue: WithdrawalQueue;
  message: string;
}

export interface GetWithdrawalQueueResponse {
  success: boolean;
  data: WithdrawalQueueData;
  error?: string;
}

// Deposit Types
export interface ExecuteDepositRequest {
  walletId: string;
  walletAddress: string;
  syrupRouterAddress: string;
  amount: string;
  depositData: string;
}

export interface ExecuteDepositData {
  approvalTxHash: string;
  depositTxHash: string;
  amount: string;
  asset: string;
  depositData: string;
  message: string;
}

export interface ExecuteDepositResponse {
  success: boolean;
  data: ExecuteDepositData;
  error?: string;
}

// Authorized Deposit Types
export interface ExecuteAuthorizedDepositRequest {
  walletId: string;
  walletAddress: string;
  poolId: string;
  syrupRouterAddress: string;
  amount: string;
  depositData: string;
}

export interface Signature {
  deadline: string;
  bitmap: string;
  r: string;
  s: string;
  v: number;
}

export interface ExecuteAuthorizedDepositData {
  approvalTxHash: string;
  depositTxHash: string;
  amount: string;
  asset: string;
  signature: Signature;
  depositData: string;
  message: string;
}

export interface ExecuteAuthorizedDepositResponse {
  success: boolean;
  data: ExecuteAuthorizedDepositData;
  error?: string;
}

// Redeem Types
export interface RequestRedeemRequest {
  walletId: string;
  walletAddress: string;
  poolAddress: string;
  shares: string;
}

export interface RequestRedeemData {
  txHash: string;
  poolAddress: string;
  shares: string;
  walletAddress: string;
  message: string;
}

export interface RequestRedeemResponse {
  success: boolean;
  data: RequestRedeemData;
  error?: string;
}

// Configuration
export interface MapleConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const MAPLE_CONFIG: MapleConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};

