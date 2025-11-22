/**
 * Admin Gas API Service Interface
 * Defines the contract for gas-related API operations
 */

import {
  GasTopupRequest,
  GasTopupResponse,
} from './types';

export interface IGasApiService {
  // Top up ETH for user wallets below threshold
  topupGas(request: GasTopupRequest): Promise<GasTopupResponse>;
}

