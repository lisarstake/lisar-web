/**
 * Campaign API Service
 */

import { http } from "@/lib/http";
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
  CAMPAIGN_CONFIG,
} from "./types";

const STUBBED_RESPONSE = { success: false as const, data: null };

export class CampaignService implements ICampaignApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = CAMPAIGN_CONFIG.baseUrl;
    this.timeout = CAMPAIGN_CONFIG.timeout;
  }

  private async makeRequest<T>(
    endpoint: string,
    config: Record<string, unknown> = {},
  ): Promise<CampaignApiResponse<T>> {
    try {
      const response = await http.request({
        url: `${this.baseUrl}${endpoint}`,
        timeout: this.timeout,
        ...config,
        headers: {
          "Content-Type": "application/json",
          ...(config.headers as Record<string, string> | undefined),
        },
      });

      return {
        success: true,
        data: response.data.data ?? response.data,
        message: response.data.message || "Success",
      } as CampaignApiResponse<T>;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
      return {
        success: false,
        data: null as T,
        message:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "An error occurred",
        error: err?.response?.data?.error || err?.message || "Unknown error",
      } as CampaignApiResponse<T>;
    }
  }

  // Early Savers Methods (stubbed — campaign is paused)
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
    return this.makeRequest<ReferralCodeData>("/referrals/code", {
      method: "GET",
    });
  }

  async applyReferralCode(
    request: ApplyReferralRequest
  ): Promise<CampaignApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>("/referrals/apply", {
      method: "POST",
      data: request,
    });
  }

  async getReferralStats(): Promise<CampaignApiResponse<ReferralStatsData>> {
    return this.makeRequest<ReferralStatsData>("/referrals/stats", {
      method: "GET",
    });
  }

  async validateReferralCode(
    code: string
  ): Promise<CampaignApiResponse<ValidateReferralData>> {
    return this.makeRequest<ValidateReferralData>(
      `/referrals/validate/${encodeURIComponent(code)}`,
      { method: "GET" },
    );
  }
}
