/**
 * Delegation API Service Interface
 * Defines the contract for delegation-related API operations
 */

import {
  DelegationApiResponse,
  OrchestratorResponse,
  DelegationData,
  DelegatorTransactionsResponse,
  DelegatorRewardsResponse,
  DelegatorStakeProfileResponse,
  WithdrawStakeRequest,
  WithdrawStakeResponse,
  RebondRequest,
  RebondResponse,
  MoveStakeRequest,
  MoveStakeResponse,
  OrchestratorQueryParams,
  ProtocolStatusResponse,
  CalculateYieldRequest,
  CalculateYieldResponse
} from './types';

export interface IDelegationApiService {
  // Orchestrators
  getOrchestrators(params?: OrchestratorQueryParams): Promise<DelegationApiResponse<OrchestratorResponse[]>>;
  
  // Delegations
  getDelegations(delegator: string): Promise<DelegationApiResponse<DelegationData>>;
  
  // Delegator Transactions
  getDelegatorTransactions(delegator: string): Promise<DelegatorTransactionsResponse>;
  
  // Delegator Rewards
  getDelegatorRewards(delegator: string): Promise<DelegatorRewardsResponse>;
  
  // Delegator Stake Profile
  getDelegatorStakeProfile(delegator: string): Promise<DelegatorStakeProfileResponse>;
  
  // Withdraw Stake
  withdrawStake(request: WithdrawStakeRequest): Promise<WithdrawStakeResponse>;

  // Rebond
  rebond(request: RebondRequest): Promise<RebondResponse>;

  // Move Stake
  moveStake(request: MoveStakeRequest): Promise<MoveStakeResponse>;

  // Protocol Status
  getProtocolStatus(): Promise<ProtocolStatusResponse>;

  // Calculate Yield
  calculateYield(request: CalculateYieldRequest): Promise<CalculateYieldResponse>;
}
