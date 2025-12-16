/**
 * Maple API Service Interface
 * Defines the contract for maple-related API operations
 */

import {
  GetPoolsResponse,
  GetPoolResponse,
  GetAuthorizationResponse,
  GetPositionsResponse,
  GetWithdrawalQueueResponse,
  ExecuteDepositRequest,
  ExecuteDepositResponse,
  ExecuteAuthorizedDepositRequest,
  ExecuteAuthorizedDepositResponse,
  RequestRedeemRequest,
  RequestRedeemResponse
} from './types';

export interface IMapleApiService {
  // Get all Syrup pools
  getPools(): Promise<GetPoolsResponse>;

  // Get Syrup pool by ID
  getPool(poolId: string): Promise<GetPoolResponse>;

  // Check user authorization for Syrup deposits
  getAuthorization(walletAddress: string): Promise<GetAuthorizationResponse>;

  // Get user's pool positions
  getPositions(walletAddress: string, poolId: string): Promise<GetPositionsResponse>;

  // Get withdrawal queue status
  getWithdrawalQueue(poolId: string): Promise<GetWithdrawalQueueResponse>;

  // Execute deposit for authorized users
  executeDeposit(request: ExecuteDepositRequest): Promise<ExecuteDepositResponse>;

  // Execute authorized deposit for unauthorized users
  executeAuthorizedDeposit(request: ExecuteAuthorizedDepositRequest): Promise<ExecuteAuthorizedDepositResponse>;

  // Request withdrawal/redemption from Syrup pool
  requestRedeem(request: RequestRedeemRequest): Promise<RequestRedeemResponse>;
}

