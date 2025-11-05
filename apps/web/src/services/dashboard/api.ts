/**
 * Dashboard API Service Interface
 * Defines the contract for dashboard-related API operations
 */

import {
  DashboardApiResponse,
  DashboardSummary,
  DashboardTransaction
} from './types';

export interface IDashboardApiService {
  // Get dashboard summary (KPIs)
  getDashboardSummary(): Promise<DashboardApiResponse<DashboardSummary>>;
  
  // Get recent transactions for dashboard
  getDashboardTransactions(limit?: number): Promise<DashboardApiResponse<DashboardTransaction[]>>;
}

