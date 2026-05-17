/**
 * Points API Service
 * Authenticated points balance, history, redemptions, milestones, and partners.
 */

import { http } from "@/lib/http";
import { IPointsApiService } from "./api";
import {
  POINTS_CONFIG,
  PointsApiResponse,
  PointsBalanceData,
  PointsHistoryEntry,
  PointsMilestone,
  PointsPartner,
  PointsRedemptionRecord,
  RedeemPointsRequest,
} from "./types";

export class PointsService implements IPointsApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = POINTS_CONFIG.baseUrl;
    this.timeout = POINTS_CONFIG.timeout;
  }

  private getStoredToken(): string | null {
    let token = localStorage.getItem("auth_token");

    const expiry = localStorage.getItem("auth_expiry");
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10) * 1000;
      if (Date.now() > expiryTime) {
        this.removeStoredTokens();
        return null;
      }
    }

    if (!token) {
      token = sessionStorage.getItem("auth_token");
    }

    return token;
  }

  private removeStoredTokens(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expiry");
    sessionStorage.removeItem("auth_token");
  }

  private async makeRequest<T>(
    endpoint: string,
    config: Record<string, unknown> = {},
  ): Promise<PointsApiResponse<T>> {
    try {
      const token = this.getStoredToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(config.headers as Record<string, string> | undefined),
      };

      const response = await http.request({
        url: `${this.baseUrl}${endpoint}`,
        timeout: this.timeout,
        headers,
        ...config,
      });

      return {
        success: true,
        data: response.data.data ?? response.data,
        message: response.data.message || "Success",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; error?: string } };
        message?: string;
      };
      return {
        success: false,
        data: null as T,
        message: err.response?.data?.message || err.response?.data?.error || "An error occurred",
        error:
          err.response?.data?.error ||
          err.message ||
          "Unknown error",
      };
    }
  }

  private async requireAuth<T>(
    endpoint: string,
    config: Record<string, unknown> = {},
  ): Promise<PointsApiResponse<T>> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        data: null as T,
        message: "Authentication required",
        error: "No authentication token found",
      };
    }
    return this.makeRequest<T>(endpoint, config);
  }

  /** GET /points/balance */
  async getBalance(): Promise<PointsApiResponse<PointsBalanceData>> {
    return this.requireAuth<PointsBalanceData>("/points/balance", {
      method: "GET",
    });
  }

  /** GET /points/history */
  async getHistory(): Promise<PointsApiResponse<PointsHistoryEntry[]>> {
    return this.requireAuth<PointsHistoryEntry[]>("/points/history", {
      method: "GET",
    });
  }

  /** POST /points/redeem */
  async redeem(
    request: RedeemPointsRequest,
  ): Promise<PointsApiResponse<PointsRedemptionRecord>> {
    return this.requireAuth<PointsRedemptionRecord>("/points/redeem", {
      method: "POST",
      data: request,
    });
  }

  /** GET /points/redemptions */
  async getRedemptions(): Promise<
    PointsApiResponse<PointsRedemptionRecord[]>
  > {
    return this.requireAuth<PointsRedemptionRecord[]>("/points/redemptions", {
      method: "GET",
    });
  }

  /** GET /points/milestones */
  async getMilestones(): Promise<PointsApiResponse<PointsMilestone[]>> {
    return this.requireAuth<PointsMilestone[]>("/points/milestones", {
      method: "GET",
    });
  }

  /** GET /points/partners */
  async getPartners(): Promise<PointsApiResponse<PointsPartner[]>> {
    return this.requireAuth<PointsPartner[]>("/points/partners", {
      method: "GET",
    });
  }
}
