/**
 * Campaign API Service
 * Real implementation for Lisar API v1
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
  CAMPAIGN_CONFIG,
} from "./types";

export class CampaignService implements ICampaignApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = CAMPAIGN_CONFIG.baseUrl;
    this.timeout = CAMPAIGN_CONFIG.timeout;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn401: boolean = true
  ): Promise<CampaignApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token exists
    const token = this.getStoredToken();
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle 401 Unauthorized - Try to refresh token
      if (response.status === 401 && retryOn401) {
        const refreshToken = this.getStoredRefreshToken();
        if (refreshToken) {
          try {
            const refreshResult = await this.refreshToken(refreshToken);
            if (refreshResult.success && refreshResult.data?.access_token) {
              return this.makeRequest<T>(endpoint, options, false);
            }
          } catch (error) {
            console.error("Token refresh failed during API call:", error);
          }
        }
        this.removeStoredTokens();
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "An error occurred",
          data: null as T,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        message: data.message || "Success",
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        data: null as T,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Token management helpers
  private getStoredToken(): string | null {
    // Check localStorage first (remembered sessions)
    let token = localStorage.getItem("auth_token");

    if (!token) {
      token = sessionStorage.getItem("auth_token");
    }

    return token;
  }

  private getStoredRefreshToken(): string | null {
    return (
      localStorage.getItem("refresh_token") ||
      sessionStorage.getItem("refresh_token")
    );
  }

  private removeStoredTokens(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_expiry");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("auth_expiry");
  }

  private async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    data?: { access_token: string; refresh_token: string };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.data) {
        const storage = localStorage.getItem("refresh_token")
          ? localStorage
          : sessionStorage;
        storage.setItem("auth_token", data.data.access_token);
        storage.setItem("refresh_token", data.data.refresh_token);

        if (data.data.expires_at) {
          storage.setItem("auth_expiry", data.data.expires_at.toString());
        }

        return { success: true, data: data.data };
      }

      return { success: false };
    } catch (error) {
      console.error("Token refresh error:", error);
      return { success: false };
    }
  }

  // Early Savers Methods
  async setTier2Milestones(
    request: SetMilestonesRequest
  ): Promise<CampaignApiResponse<SetMilestonesResponse>> {
    return this.makeRequest<SetMilestonesResponse>("/early-savers/tier2/milestones", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  async getCampaignStatus(): Promise<CampaignApiResponse<CampaignStatusData>> {
    return this.makeRequest<CampaignStatusData>("/early-savers/status", {
      method: "GET",
    });
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
      body: JSON.stringify(request),
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
    return this.makeRequest<ValidateReferralData>(`/referrals/validate/${code}`, {
      method: "GET",
    });
  }
}
