/**
 * Delegation API Types
 * Defines interfaces for delegation-related API operations
 */

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
  apy: string;
  totalStake: string;
  totalVolumeETH: string;
  performance: string;
  fee: string;
  reward: string;
  active: boolean;
  activeSince: string;
  description: string;
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

// Configuration
export interface DelegationConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const DELEGATION_CONFIG: DelegationConfig = {
  baseUrl: 'https://lisar-api-1.onrender.com/api/v1',
  timeout: 30000,
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
