/**
 * Dashboard API Types
 * Defines interfaces for dashboard-related API operations
 */

import { env } from '@/lib/env'

// Base API Response
export interface DashboardApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Dashboard Summary Types
export interface DashboardSummary {
  totalDelegators: number;
  totalNgNConverted: number;
  totalLptDelegated: number;
  totalValidators: number; 
  lastUpdated: string;
}

// Dashboard Transaction Types
export interface DashboardTransaction {
  address: string;
  event: string;
  description: string;
  date: string;
  transaction_hash: string;
}

// Configuration
export interface DashboardConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const DASHBOARD_CONFIG: DashboardConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 30000,
  retryAttempts: 3,
};

