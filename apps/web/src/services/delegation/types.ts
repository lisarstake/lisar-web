/**
 * Delegation API Types
 * Defines interfaces for delegation-related API operations
 */

import { EnsIdentity } from '../ens/types';
import { env } from '@/lib/env';

// Base API Response
export interface DelegationApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Nested API Response for orchestrators
export interface OrchestratorApiResponse {
  success: boolean;
  message: string;
  data: {
    data: OrchestratorResponse[];
  };
}

// Orchestrator Types
export interface OrchestratorResponse {
  address: string;
  ensName: string;
  avatar?: string;
  apy: string;
  totalStake: string;
  totalVolumeETH: string;
  performance: string;
  fee: string;
  reward: string;
  active: boolean;
  activeSince: string;
  description: string;
  yieldSource?: string;
  ensIdentity?: EnsIdentity; 
}

// Stake Types
export interface StakeRequest {
  walletId: string;
  walletAddress: string;
  orchestratorAddress: string;
  amount: string;
}

export interface StakeResponse {
  success: boolean;
  data: {
    transactionHash: string;
    blockNumber: string;
  };
}

// Unbond Types
export interface UnbondRequest {
  walletId: string;
  walletAddress: string;
  amount: string;
}

export interface UnbondResponse {
  success: boolean;
  txHash: string;
}

// Withdraw Types
export interface WithdrawStakeRequest {
  walletId: string;
  walletAddress: string;
  unbondingLockId: number;
}

export interface WithdrawStakeResponse {
  success: boolean;
  txHash?: string;
  message?: string;
  error?: string;
}

// Rebond Types
export interface RebondRequest {
  delegatorAddress: string;
  unbondingLockId: number;
  newPosPrev: string;
  newPosNext: string;
  walletId: string;
}

export interface RebondResponse {
  success: boolean;
  txHash?: string;
  message?: string;
  error?: string;
}

// Move Stake Types
export interface MoveStakeRequest {
  walletId: string;
  walletAddress: string;
  oldDelegate: string;
  newDelegate: string;
  amount: string;
}

export interface MoveStakeResponse {
  success: boolean;
  txHash?: string;
  message?: string;
  error?: string;
}

// Delegation Types
export interface DelegationData {
  bondedAmount: string;
  delegate: {
    active: boolean;
    feeShare: string;
    id: string;
    rewardCut: string;
    status: string;
    totalStake: string;
  };
  delegatedAmount: string;
  fees: string;
  id: string;
  lastClaimRound: {
    id: string;
  };
  principal: string;
  startRound: string;
  unbonded: string;
  unbondingLocks: any[];
  withdrawnFees: string;
}

export interface DelegationResponse {
  success: boolean;
  data: DelegationData;
}

// Delegator Transaction Types
export interface DelegatorTransaction {
  id: string;
  amount: string;
  delegate: {
    id: string;
  };
  unbondingLockId?: number;
  withdrawRound?: string;
  roundsRemaining?: number;
  daysRemaining?: number;
  timeRemainingFormatted?: string;
  estimatedAvailableDate?: string;
}

export interface DelegatorTransactionsData {
  pendingStakeTransactions: DelegatorTransaction[];
  completedStakeTransactions: DelegatorTransaction[];
  currentRound: string;
}

export interface DelegatorTransactionsResponse {
  success: boolean;
  data: DelegatorTransactionsData;
  message?: string;
  error?: string;
}

// Delegator Rewards Types
export interface DelegatorReward {
  round: string;
  rewardTokens: string;
  delegate: string;
  timestamp: number;
  transactionHash: string;
}

export interface DelegatorRewardsData {
  rewards: DelegatorReward[];
}

export interface DelegatorRewardsResponse {
  success: boolean;
  data: DelegatorRewardsData;
  message?: string;
  error?: string;
}

// Delegator Stake Profile Types
export interface DelegatorStakeProfile {
  delegator: string;
  currentStake: string;
  lifetimeStaked: string;
  lifetimeUnbonded: string;
  lifetimeRewards: string;
}

export interface DelegatorStakeProfileResponse {
  success: boolean;
  data: DelegatorStakeProfile;
  message?: string;
  error?: string;
}

// Orchestrator Query Parameters
export interface OrchestratorQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "apy" | "totalStake" | "activeSince" | "totalVolumeETH" | "fee" | "reward";
  sortOrder?: "asc" | "desc";
  active?: boolean;
}

// Calculate Yield Types
export type YieldPeriod = "daily" | "weekly" | "monthly" | "6months" | "yearly" | "";

export interface CalculateYieldRequest {
  amount: number;
  apy: string; // e.g. "5.2%"
  period?: YieldPeriod; // leave empty string to fetch all
  includeCurrencyConversion?: boolean;
  currency?: string; // e.g. "USD"
}

export interface YieldProjection {
  period: string;
  projectedReward: number;
  currency?: string;
  apy: string;
  amount: number;
}

export interface CalculateYieldData {
  projections: YieldProjection[];
}

export interface CalculateYieldResponse extends DelegationApiResponse<CalculateYieldData | any> {}

// Configuration
export interface DelegationConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const DELEGATION_CONFIG: DelegationConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};

// Protocol Status
export interface ProtocolStatusData {
  currentRound: number;
  currentL1Block: number;
  roundLength: number;
  blocksRemaining: number;
  estimatedNextRoundAt: number;
  startBlock: number;
  blocksIntoRound: number;
  initialized: boolean;
  estimatedHours: number;
  estimatedHoursRounded: number;
  estimatedHoursHuman: string;
}

export interface ProtocolStatusResponse {
  success: boolean;
  data: ProtocolStatusData;
  message?: string;
  error?: string;
}
