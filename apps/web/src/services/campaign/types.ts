/**
 * Campaign API Types
 */

import { env } from '@/lib/env'

// Base API Response
export interface CampaignApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

// Early Savers Types
export interface SetMilestonesRequest {
  activities: string[];
}

export interface SetMilestonesResponse {
  selectedActivities: string[];
}

export interface CampaignEnrollment {
  [key: string]: unknown;
}

export interface CampaignProgress {
  [key: string]: unknown;
}

export interface CampaignStatusData {
  enrollment: CampaignEnrollment;
  progress: CampaignProgress;
}

// Referral Types
export interface ReferralCodeData {
  referralCode: string;
}

export interface ApplyReferralRequest {
  code: string;
}

export interface ReferralUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface ReferralStatsData {
  totalReferrals: number;
  referralCode: string;
  referrals: ReferralUser[];
}

export interface ValidateReferralData {
  valid: boolean;
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
  retryAttempts: 3
};
