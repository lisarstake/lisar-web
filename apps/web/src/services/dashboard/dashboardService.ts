/**
 * Dashboard API Service
 * Real implementation for dashboard operations
 * Public endpoints - no authentication required
 */

import { IDashboardApiService } from "./api";
import {
  DashboardApiResponse,
  DashboardSummary,
  DashboardTransaction,
  DASHBOARD_CONFIG,
} from "./types";
import { http } from "@/lib/http";

export class DashboardService implements IDashboardApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = DASHBOARD_CONFIG.baseUrl;
    this.timeout = DASHBOARD_CONFIG.timeout;
  }

  // Helper method for making HTTP requests (public endpoints - no auth)
  private async makeRequest<T>(
    endpoint: string,
    config: any = {}
  ): Promise<DashboardApiResponse<T>> {
    try {
      const headers = {
        "Content-Type": "application/json",
        ...config.headers,
      };

      const response = await http.request({
        url: `${this.baseUrl}${endpoint}`,
        timeout: this.timeout,
        headers,
        ...config,
      });

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Success",
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as T,
        message: error.response?.data?.message || "An error occurred",
        error: error.response?.data?.error || error.message || "Unknown error",
      };
    }
  }

  /**
   * Get dashboard summary (KPIs)
   */
  async getDashboardSummary(): Promise<DashboardApiResponse<DashboardSummary>> {
    return this.makeRequest<DashboardSummary>("/admin/dashboard/summary", {
      method: "GET",
    });
  }

  /**
   * Get recent transactions for dashboard
   */
  async getDashboardTransactions(limit: number = 15): Promise<DashboardApiResponse<DashboardTransaction[]>> {
    const endpoint = `/admin/dashboard/transactions?limit=${limit}`;
    return this.makeRequest<DashboardTransaction[]>(endpoint, {
      method: "GET",
    });
  }
}

