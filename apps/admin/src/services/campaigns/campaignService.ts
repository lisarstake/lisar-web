/**
 * Campaign API Service
 * Real implementation for Lisar Admin API v1
 */

import { ICampaignApiService } from "./api";
import {
  CampaignApiResponse,
  CampaignStats,
  CampaignFilters,
  PaginatedCampaignUsersResponse,
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

      // Handle 401 Unauthorized
      if (response.status === 401 && retryOn401) {
        const refreshToken = this.getStoredRefreshToken();
        if (refreshToken) {
          try {
            const refreshResult = await this.refreshToken(refreshToken);
            if (refreshResult.success) {
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
          data: undefined,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        message: data.message,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        message: "Network error occurred",
        data: undefined,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Token management helpers
  private getStoredToken(): string | null {
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

  private async refreshToken(refreshToken: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.data?.access_token) {
        const storage = localStorage.getItem("refresh_token")
          ? localStorage
          : sessionStorage;
        storage.setItem("auth_token", data.data.access_token);
        storage.setItem("refresh_token", data.data.refresh_token);

        if (data.data.expires_at) {
          storage.setItem("auth_expiry", data.data.expires_at.toString());
        }

        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error("Token refresh failed:", error);
      return { success: false };
    }
  }

  /**
   * Get campaign statistics
   * TODO: Replace with real API call when endpoint is ready
   */
  async getCampaignStats(): Promise<CampaignApiResponse<CampaignStats>> {
    // Stubbed data with dummy users
    return Promise.resolve({
      success: true,
      data: {
        tier1Count: 1,
        tier2Count: 1,
        tier3Count: 1,
      },
    });
  }

  /**
   * Get paginated campaign users
   * TODO: Replace with real API call when endpoint is ready
   */
  async getCampaignUsers(
    filters: CampaignFilters
  ): Promise<CampaignApiResponse<PaginatedCampaignUsersResponse>> {
    // Dummy users for preview
    const allUsers = [
      {
        user_id: "user_tier1_001",
        full_name: "Chioma Adewale",
        email: "chioma.adewale@example.com",
        img: null,
        joined_campaign: "2026-01-05T10:30:00.000Z",
        wallet_balance: 25000,
        tier: "tier_1" as const,
        status: "in_progress" as const,
      },
      {
        user_id: "user_tier2_001",
        full_name: "Emeka Okonkwo",
        email: "emeka.okonkwo@example.com",
        img: null,
        joined_campaign: "2025-12-10T14:20:00.000Z",
        wallet_balance: 45000,
        tier: "tier_2" as const,
        status: "completed" as const,
      },
      {
        user_id: "user_tier3_001",
        full_name: "Aisha Bello",
        email: "aisha.bello@example.com",
        img: null,
        joined_campaign: "2025-11-15T09:15:00.000Z",
        wallet_balance: 120000,
        tier: "tier_3" as const,
        status: "in_progress" as const,
      },
    ];

    // Filter by tier if specified
    const filteredUsers = filters.tier
      ? allUsers.filter((user) => user.tier === filters.tier)
      : allUsers;

    // Filter by status if specified and not "all"
    const finalUsers =
      filters.status && filters.status !== "all"
        ? filteredUsers.filter((user) => user.status === filters.status)
        : filteredUsers;

    return Promise.resolve({
      success: true,
      data: {
        users: finalUsers,
        total: finalUsers.length,
        page: filters.page || 1,
        limit: filters.limit || 50,
        totalPages: 1,
      },
    });
  }
}
