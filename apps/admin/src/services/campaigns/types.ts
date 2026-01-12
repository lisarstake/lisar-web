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

// Campaign Tier Type (API uses numbers)
export type CampaignTier = 1 | 2 | 3;

// Campaign Status Type
export type CampaignStatus = 'active' | 'completed' | 'champion' | 'withdrawn';

// Milestone Type
export interface Milestone {
  milestone_type: 'kyc_completed' | 'first_deposit' | 'day_8_bonus_credited' | string;
  completed_at: string;
  metadata: Record<string, any>;
}

// Topup History
export interface TopupHistory {
  id: string;
  user_id: string;
  wallet_address: string;
  network: 'ethereum' | 'solana';
  transaction_type: string;
  amount: string;
  status: 'pending' | 'success' | 'failed';
  transaction_hash: string | null;
  error_reason: string | null;
  created_at: string;
}

// Scheduled Task
export interface ScheduledTask {
  id: string;
  task_type: string;
  tier: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  scheduled_for: string;
  executed_at: string | null;
  retry_count: number;
}

// Campaign User Model (matches API response)
export interface CampaignUser {
  user_id: string;
  user_email: string;
  user_wallet_address: string;
  enrollment_id: string;
  current_tier: CampaignTier;
  status: CampaignStatus;
  enrolled_at: string;
  tier_1_start_date: string | null;
  tier_1_completed_at: string | null;
  tier_2_start_date: string | null;
  tier_2_completed_at: string | null;
  tier_3_start_date: string | null;
  tier_3_completed_at: string | null;
  total_milestones_completed: number;
  milestones_by_tier: {
    tier_1: Milestone[];
    tier_2: Milestone[];
    tier_3: Milestone[];
  };
  first_deposit_amount_ngn: number;
  first_deposit_at: string | null;
  total_bonus_earned_ngn: number;
  topup_history: TopupHistory[];
  scheduled_tasks: ScheduledTask[];
}

// Recent Enrollment (from overview endpoint)
export interface RecentEnrollment {
  user_id: string;
  user_email: string;
  current_tier: CampaignTier;
  status: CampaignStatus;
  enrolled_at: string;
  total_bonus_earned_ngn: number;
  completed_milestones_count: number;
}

// Failed Topup (from overview endpoint)
export interface FailedTopup {
  id: string;
  user_id: string;
  wallet_address: string;
  network: string;
  transaction_type: string;
  status: string;
  error_reason: string;
  amount: string;
  created_at: string;
}

// Campaign Overview (from /overview endpoint)
export interface CampaignOverview {
  total_enrollments: number;
  active_enrollments: number;
  completed_tier_1: number;
  completed_tier_2: number;
  completed_tier_3: number;
  champions: number;
  total_bonuses_paid_ngn: number;
  users_by_tier: {
    tier_1: number;
    tier_2: number;
    tier_3: number;
  };
  recent_enrollments: RecentEnrollment[];
  recent_completions: RecentEnrollment[];
  failed_topups: FailedTopup[];
}

// Paginated Campaign Users Response
export interface PaginatedCampaignUsersResponse {
  data: CampaignUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Campaign Search Filters
export interface CampaignSearchFilters {
  email?: string;
  userId?: string;
  tier?: 1 | 2 | 3;
  status?: CampaignStatus;
  page?: number;
  limit?: number;
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
