/**
 * KYC API Service Interface
 * Defines the contract for KYC-related API operations
 */

import {
  KycApiResponse,
  KycStatusData,
  StartKycRequest,
  StartKycData,
  KycSessionData,
  KycDetailsData
} from './types';

export interface IKycApiService {
  /**
   * Get user's KYC verification status
   * @returns Current KYC status including tier and provider
   */
  getStatus(): Promise<KycApiResponse<KycStatusData>>;

  /**
   * Start KYC verification process
   * @param request - Contains tier level (tier_1, tier_2, tier_3)
   * @returns KYC session details including verification URL
   */
  startVerification(request: StartKycRequest): Promise<KycApiResponse<StartKycData>>;

  /**
   * Get current verification session URL
   * Retrieves the verification URL for users with pending KYC
   * @returns Current session details if available
   */
  getSession(): Promise<KycApiResponse<KycSessionData>>;

  /**
   * Get full KYC details (fetched on-demand from provider)
   * @returns Complete KYC details if approved
   */
  getDetails(): Promise<KycApiResponse<KycDetailsData>>;
}
