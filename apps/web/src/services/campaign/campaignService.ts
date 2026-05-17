/**
 * Campaign API Service
 * Stubbed — campaign is paused. All methods return empty responses.
 */

import { ICampaignApiService } from "./api";
import {
  CampaignApiResponse,
  SetMilestonesRequest,
  SetMilestonesResponse,
  CampaignStatusData,
  ReferralCodeData,
  ApplyReferralRequest,
  ReferralStatsData,
  ValidateReferralData,
} from "./types";

const STUBBED_RESPONSE = { success: false as const, data: null };

export class CampaignService implements ICampaignApiService {
  // Early Savers Methods
  async setTier2Milestones(
    _request: SetMilestonesRequest
  ): Promise<CampaignApiResponse<SetMilestonesResponse>> {
    return Promise.resolve(STUBBED_RESPONSE as unknown as CampaignApiResponse<SetMilestonesResponse>);
  }

  async getCampaignStatus(): Promise<CampaignApiResponse<CampaignStatusData>> {
    return Promise.resolve(STUBBED_RESPONSE as unknown as CampaignApiResponse<CampaignStatusData>);
  }

  // Referral Methods
  async getReferralCode(): Promise<CampaignApiResponse<ReferralCodeData>> {
    return Promise.resolve(STUBBED_RESPONSE as unknown as CampaignApiResponse<ReferralCodeData>);
  }

  async applyReferralCode(
    _request: ApplyReferralRequest
  ): Promise<CampaignApiResponse<{ message: string }>> {
    return Promise.resolve(STUBBED_RESPONSE as unknown as CampaignApiResponse<{ message: string }>);
  }

  async getReferralStats(): Promise<CampaignApiResponse<ReferralStatsData>> {
    return Promise.resolve(STUBBED_RESPONSE as unknown as CampaignApiResponse<ReferralStatsData>);
  }

  async validateReferralCode(
    _code: string
  ): Promise<CampaignApiResponse<ValidateReferralData>> {
    return Promise.resolve(STUBBED_RESPONSE as unknown as CampaignApiResponse<ValidateReferralData>);
  }
}
