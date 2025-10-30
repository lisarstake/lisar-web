/**
 * Leaderboard API Service
 * Real implementation for earner leaderboard operations
 */

import { ILeaderboardApiService } from "./api";
import { http } from "@/lib/http";
import {
  EarnerLeaderboardQuery,
  EarnerLeaderboardResponse,
  LeaderboardApiResponse,
  LEADERBOARD_CONFIG,
} from "./types";

export class LeaderboardService implements ILeaderboardApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = LEADERBOARD_CONFIG.baseUrl;
    this.timeout = LEADERBOARD_CONFIG.timeout;
  }

  private getStoredToken(): string | null {
    let token = localStorage.getItem("auth_token");
    if (!token) {
      token = sessionStorage.getItem("auth_token");
    }
    const expiry =
      localStorage.getItem("auth_expiry") ||
      sessionStorage.getItem("auth_expiry");
    if (expiry && Date.now() > Number(expiry)) {
      this.removeStoredTokens();
      return null;
    }
    return token;
  }

  private removeStoredTokens(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expiry");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_expiry");
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    config: any = {}
  ): Promise<LeaderboardApiResponse<T>> {
    try {
      const token = this.getStoredToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config.headers,
      };
      const response = await http.request({
        url: `${this.baseUrl}${endpoint}`,
        timeout: this.timeout,
        ...config,
        headers,
      });

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Success",
      } as LeaderboardApiResponse<T>;
    } catch (error: any) {
      return {
        success: false,
        data: null as T,
        message: error?.response?.data?.message || "An error occurred",
        error:
          error?.response?.data?.error || error?.message || "Unknown error",
      } as LeaderboardApiResponse<T>;
    }
  }

  // GET /earners/leaderboard
  async getEarnerLeaderboard(
    params?: EarnerLeaderboardQuery
  ): Promise<LeaderboardApiResponse<EarnerLeaderboardResponse["data"]>> {
    let endpoint = "/earners/leaderboard";

    if (params) {
      const query = new URLSearchParams();
      if (params.limit !== undefined)
        query.append("limit", String(params.limit));
      if (params.offset !== undefined)
        query.append("offset", String(params.offset));
      if (params.orderBy) query.append("orderBy", params.orderBy);
      if (params.orderDirection)
        query.append("orderDirection", params.orderDirection);

      if (params.timePeriod) query.append("timeperiod", params.timePeriod);

      const qs = query.toString();
      if (qs) endpoint += `?${qs}`;
    }

    return this.makeRequest<EarnerLeaderboardResponse["data"]>(endpoint, {
      method: "GET",
    });
  }
}
