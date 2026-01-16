/**
 * Campaign API Service Interface
 * Defines the contract for campaign-related API operations
 */

import {
  CampaignApiResponse,
  SetMilestonesRequest,
  SetMilestonesResponse,
  CampaignStatusData,
  ReferralCodeData,
  ApplyReferralRequest,
  ReferralStatsData,
  ValidateReferralData
} from './types';

export interface ICampaignApiService {
  // Early Savers
  setTier2Milestones(request: SetMilestonesRequest): Promise<CampaignApiResponse<SetMilestonesResponse>>;
  getCampaignStatus(): Promise<CampaignApiResponse<CampaignStatusData>>;
  
  // Referrals
  getReferralCode(): Promise<CampaignApiResponse<ReferralCodeData>>;
  applyReferralCode(request: ApplyReferralRequest): Promise<CampaignApiResponse<{ message: string }>>;
  getReferralStats(): Promise<CampaignApiResponse<ReferralStatsData>>;
  validateReferralCode(code: string): Promise<CampaignApiResponse<ValidateReferralData>>;
}
