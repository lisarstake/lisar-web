/**
 * Leaderboard API Types
 */

// Base API Response
export interface LeaderboardApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Query params for earner leaderboard
export interface EarnerLeaderboardQuery {
  limit?: number;
  offset?: number;
  orderBy?:
    | "lifetimeReward"
    | "bondedAmount"
    | "delegatedAmount"
    | "lastClaimRound";
  orderDirection?: "asc" | "desc";
  timePeriod?: "daily" | "weekly" | "monthly" | "yearly" | "all";
}

export interface EarnerDelegateInfo {
  address: string;
  feeShare: string;
  rewardCut: string;
}

export interface EarnerEntry {
  rank: number;
  address: string;
  email?: string;
  full_name?: string;
  bondedAmount: string;
  lifetimeReward: string;
  delegatedAmount: string;
  lastClaimRound: string;
  delegate: EarnerDelegateInfo;
}

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

export interface EarnerLeaderboardData {
  earners: EarnerEntry[];
  pagination: Pagination;
}

export interface EarnerLeaderboardResponse {
  success: boolean;
  data: EarnerLeaderboardData;
}

// API Configuration
export interface LeaderboardConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const LEADERBOARD_CONFIG: LeaderboardConfig = {
  baseUrl: "https://lisar-api-1.onrender.com/api/v1",
  timeout: 30000,
  retryAttempts: 3,
};
