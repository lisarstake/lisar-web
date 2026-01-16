/**
 * Campaign Service Implementation
 * Handles all campaign-related API calls
 */

import type {
  CampaignApiResponse,
  CampaignOverview,
  CampaignUser,
  PaginatedCampaignUsersResponse,
  CampaignSearchFilters,
  TopupHistory,
  CAMPAIGN_CONFIG,
} from './types';
import type { ICampaignApiService } from './api';
import { env } from '@/lib/env';

/**
 * Campaign Service Class
 */
class CampaignService implements ICampaignApiService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = env.VITE_API_BASE_URL;
    this.timeout = 100000;
  }

  /**
   * Helper method for making HTTP requests (public endpoints - no auth required)
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CampaignApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

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
      const data = await response.json().catch(() => ({}));

      return {
        success: response.ok,
        message: data.message,
        data: (data.data as T) ?? (data as T),
        error: response.ok ? undefined : (data.error || data.message),
      } as CampaignApiResponse<T>;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred',
      };
    }
  }

  /**
   * Get campaign overview statistics
   */
  async getCampaignOverview(): Promise<CampaignApiResponse<CampaignOverview>> {
    return this.makeRequest<CampaignOverview>(
      '/early-savers/dashboard/overview'
    );
  }

  /**
   * Get paginated list of all enrolled users
   */
  async getCampaignUsers(
    page: number = 1,
    limit: number = 20
  ): Promise<CampaignApiResponse<PaginatedCampaignUsersResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await this.makeRequest<any>(
      `/early-savers/dashboard/users?${params.toString()}`
    );

    // Transform response to match expected structure
    if (response.success && response.data) {
      const users = Array.isArray(response.data) ? response.data : [];
      const pagination = (response as any).pagination || {
        total: users.length,
        page: page,
        limit: limit,
        total_pages: Math.ceil(users.length / limit),
      };

      return {
        success: true,
        data: {
          data: users,
          pagination,
        },
      };
    }

    return response;
  }

  /**
   * Search and filter campaign users
   */
  async searchCampaignUsers(
    filters: CampaignSearchFilters
  ): Promise<CampaignApiResponse<PaginatedCampaignUsersResponse>> {
    const params = new URLSearchParams();

    if (filters.email) params.append('email', filters.email);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.tier) params.append('tier', filters.tier.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await this.makeRequest<any>(
      `/early-savers/dashboard/search?${params.toString()}`
    );

    // Transform response to match expected structure
    if (response.success && response.data) {
      const users = Array.isArray(response.data) ? response.data : [];
      const pagination = (response as any).pagination || {
        total: users.length,
        page: filters.page || 1,
        limit: filters.limit || 20,
        total_pages: Math.ceil(users.length / (filters.limit || 20)),
      };

      return {
        success: true,
        data: {
          data: users,
          pagination,
        },
      };
    }

    return response;
  }

  /**
   */
  async getCampaignUserDetail(
    userId: string
  ): Promise<CampaignApiResponse<CampaignUser>> {
    return this.makeRequest<CampaignUser>(
      `/early-savers/dashboard/user/${userId}`
    );
  }

  /**
   * Get bonus transfer history for a user
   */
  async getUserTopups(
    userId: string
  ): Promise<CampaignApiResponse<TopupHistory[]>> {
    return this.makeRequest<TopupHistory[]>(
      `/early-savers/dashboard/user/${userId}/topups`
    );
  }
}

// Export singleton instance
export default new CampaignService();
