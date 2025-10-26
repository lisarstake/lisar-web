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
