/**
 * Ramp API Service Interface
 * Defines the contract for ramp-related API operations
 */

import {
  RampApiResponse,
  OrderData,
  CreateBuyOrderRequest,
  CreateSellOrderRequest,
  BankInfo,
  BankLookupRequest,
  AccountLookupResponse,
} from "./types";

export interface IRampApiService {
  // Create buy order (Fiat to Crypto)
  createBuyOrder(
    request: CreateBuyOrderRequest,
  ): Promise<RampApiResponse<OrderData>>;

  // Create sell order (Crypto to Fiat)
  createSellOrder(
    request: CreateSellOrderRequest,
  ): Promise<RampApiResponse<OrderData>>;

  // Get order by ID
  getOrder(orderId: string): Promise<RampApiResponse<OrderData>>;

  // Get supported banks
  getBanks(): Promise<RampApiResponse<BankInfo[]>>;

  // Lookup account name by account number and bank code
  lookupAccount(
    request: BankLookupRequest,
  ): Promise<RampApiResponse<AccountLookupResponse>>;
}
