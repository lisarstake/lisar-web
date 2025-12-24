/**
 * TOTP API Service Interface
 * Defines the contract for TOTP (2FA) related API operations
 */

import {
  TotpSetupResponse,
  TotpVerifyRequest,
  TotpVerifyResponse,
} from './types';

export interface ITotpApiService {
  // Setup TOTP
  setup(): Promise<TotpSetupResponse>;

  // Verify TOTP
  verify(request: TotpVerifyRequest): Promise<TotpVerifyResponse>;
}

