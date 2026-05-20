/**
 * Points API Types
 */

import { env } from "@/lib/env";

/** Matches Lisar API envelope used across services */
export interface PointsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PointsBalanceData {
  referral_points: number;
  deposit_points: number;
  total_points: number;
  can_redeem: boolean;
  points_to_next_redemption: number;
  daily_accrual_rate: number;
}

export interface PointsHistoryEntry {
  id: string;
  points: number;
  type: string;
  description: string;
  metadata: Record<string, unknown>;
  accrual_date: string;
  created_at: string;
}

export interface RedeemPointsRequest {
  partner_id: string;
  points: number;
  item_cost: number;
}

export interface PointsRedemptionRecord {
  id: string;
  points_spent: number;
  referral_points_used: number;
  deposit_points_used: number;
  coupon_code: string;
  discount_value_ngn: number;
  item_cost: number;
  amount_to_pay: number;
  payout_status: string;
  nomba_reference: string;
  status: string;
  expires_at: string;
  created_at: string;
}

export interface MilestoneConfig {
  key: string;
  triggerType: string;
  triggerValue: number;
  bonus: number;
}

export interface PointsMilestone {
  id: string;
  user_id: string;
  milestone_key: string;
  triggered_at: string;
  config: MilestoneConfig;
}

export interface PointsPartner {
  id: string;
  name: string;
  display_name: string;
  referral_code: string;
  is_active: boolean;
}

export interface PointsConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const POINTS_CONFIG: PointsConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};
