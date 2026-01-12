/**
 * Campaign API Service Interface
 * Defines the contract for campaign-related API operations
 */

import {
  CampaignApiResponse,
  CampaignOverview,
  CampaignUser,
  PaginatedCampaignUsersResponse,
  CampaignSearchFilters,
  TopupHistory,
} from './types';

export interface ICampaignApiService {
  /**
   * Get campaign overview statistics and recent activity
   * GET /early-savers/dashboard/overview
   */
  getCampaignOverview(): Promise<CampaignApiResponse<CampaignOverview>>;

  /**
   * Get paginated list of all enrolled campaign users
   * GET /early-savers/dashboard/users
   */
  getCampaignUsers(
    page?: number,
    limit?: number
  ): Promise<CampaignApiResponse<PaginatedCampaignUsersResponse>>;

  /**
   * Search and filter campaign users
   * GET /early-savers/dashboard/search
   */
  searchCampaignUsers(
    filters: CampaignSearchFilters
  ): Promise<CampaignApiResponse<PaginatedCampaignUsersResponse>>;

  /**
   * Get detailed campaign status for a specific user
   * GET /early-savers/dashboard/user/:userId
   */
  getCampaignUserDetail(
    userId: string
  ): Promise<CampaignApiResponse<CampaignUser>>;

  /**
   * Get bonus transfer history for a user
   * GET /early-savers/dashboard/user/:userId/topups
   */
  getUserTopups(
    userId: string
  ): Promise<CampaignApiResponse<TopupHistory[]>>;
}
