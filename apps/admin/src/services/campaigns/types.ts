/**
 * Admin Campaigns API Types
 */

import { env } from '@/lib/env'

// Base API Response
export interface CampaignApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Campaign Tier Type
export type CampaignTier = 'tier_1' | 'tier_2' | 'tier_3';

// Campaign Status Type
export type CampaignStatus = 'in_progress' | 'completed' | 'failed';

// Campaign User Model
export interface CampaignUser {
  user_id: string;
  full_name: string;
  email: string;
  img: string | null;
  joined_campaign: string; // Date when user joined campaign
  wallet_balance: number; // User's wallet balance
  tier: CampaignTier;
  status: CampaignStatus;
}

// Campaign Statistics
export interface CampaignStats {
  tier1Count: number; // Number of users in Tier 1 - Early Saver
  tier2Count: number; // Number of users in Tier 2 - Consistent Saver
  tier3Count: number; // Number of users in Tier 3 - Champion Saver
}

// Paginated Campaign Users Response
export interface PaginatedCampaignUsersResponse {
  users: CampaignUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Campaign Filters
export interface CampaignFilters {
  page?: number;
  limit?: number;
  tier?: CampaignTier;
  status?: CampaignStatus | 'all';
  sortBy?: 'wallet_balance' | 'joined_campaign' | 'full_name';
  sortOrder?: 'asc' | 'desc';
}

// API Configuration
export interface CampaignConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const CAMPAIGN_CONFIG: CampaignConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};
