/**
 * Campaign API Service Interface
 * Defines the contract for campaign-related API operations
 */

import {
  CampaignApiResponse,
  CampaignStats,
  CampaignFilters,
  PaginatedCampaignUsersResponse,
} from './types';

export interface ICampaignApiService {
  /**
   * Get campaign statistics (counts for each tier)
   */
  getCampaignStats(): Promise<CampaignApiResponse<CampaignStats>>;

  /**
   * Get paginated campaign users based on filters
   */
  getCampaignUsers(
    filters: CampaignFilters
  ): Promise<CampaignApiResponse<PaginatedCampaignUsersResponse>>;
}
