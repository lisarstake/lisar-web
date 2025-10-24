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

// Configuration
export interface DelegationConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const DELEGATION_CONFIG: DelegationConfig = {
  baseUrl: 'https://lisar-api-1.onrender.com/api/v1',
  timeout: 10000,
  retryAttempts: 3,
};
