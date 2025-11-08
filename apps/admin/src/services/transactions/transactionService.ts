/**
 * Admin Transactions API Service
 */

import {
  TransactionApiResponse,
  DashboardSummary,
  Transaction,
  TransactionStats,
  TransactionFilters,
  PaginatedTransactionsResponse,
  TransactionDetail,
  TRANSACTION_CONFIG,
  DashboardTransaction,
} from "./types";
import { ITransactionApiService } from "./api";

export class TransactionService implements ITransactionApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = TRANSACTION_CONFIG.baseUrl;
    this.timeout = TRANSACTION_CONFIG.timeout;
  }

  // Helper method for making HTTP requests (with auth)
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<TransactionApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = this.getStoredToken();
    if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    return {
      success: response.ok,
      message: data.message,
      data: (data.data as T) ?? (data as T),
      error: response.ok ? undefined : data.error,
    } as TransactionApiResponse<T>;
  }

  // Helper method for making public HTTP requests (no auth)
  private async makePublicRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<TransactionApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return {
          success: true,
          message: data.message || "Success",
          data: (data.data as T) || (data as T),
        } as TransactionApiResponse<T>;
      } else {
        return {
          success: false,
          message: data.message || "An error occurred",
          data: null as unknown as T,
          error: data.error || "Unknown error",
        } as TransactionApiResponse<T>;
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "An error occurred",
        data: null as unknown as T,
        error: error.message || "Unknown error",
      } as TransactionApiResponse<T>;
    }
  }

  // Token helper
  private getStoredToken(): string | null {
    return (
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  }

  // Helper to check authentication before making request
  private checkAuth<T>(): TransactionApiResponse<T> | null {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "Not authenticated",
        data: null as unknown as T,
        error: "No authentication token found",
      };
    }
    return null;
  }

  // Get dashboard summary
  async getDashboardSummary(): Promise<
    TransactionApiResponse<DashboardSummary>
  > {
    return this.makePublicRequest<DashboardSummary>(
      "/admin/dashboard/summary",
      {
        method: "GET",
      }
    );
  }

  // Get transactions list
  async getTransactions(
    limit: number = 15
  ): Promise<TransactionApiResponse<DashboardTransaction[]>> {
    const endpoint = `/admin/dashboard/transactions?limit=${limit}`;
    return this.makePublicRequest<DashboardTransaction[]>(endpoint, {
      method: "GET",
    });
  }

  // Get all transactions with filters and pagination
  async getAllTransactions(
    filters?: TransactionFilters
  ): Promise<TransactionApiResponse<PaginatedTransactionsResponse>> {
    const authError = this.checkAuth<PaginatedTransactionsResponse>();
    if (authError) return authError;

    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const endpoint = `/admin/transactions${params.toString() ? `?${params.toString()}` : ""}`;
    return this.makeRequest<PaginatedTransactionsResponse>(endpoint, {
      method: "GET",
    });
  }

  // Get transaction statistics
  async getTransactionStats(): Promise<
    TransactionApiResponse<TransactionStats>
  > {
    const authError = this.checkAuth<TransactionStats>();
    if (authError) return authError;

    return this.makeRequest<TransactionStats>("/admin/transactions/stats", {
      method: "GET",
    });
  }

  // Get failed transactions
  async getFailedTransactions(
    limit: number = 10
  ): Promise<TransactionApiResponse<Transaction[]>> {
    const authError = this.checkAuth<Transaction[]>();
    if (authError) return authError;

    const endpoint = `/admin/transactions/failed?limit=${limit}`;
    return this.makeRequest<Transaction[]>(endpoint, {
      method: "GET",
    });
  }

  // Get pending transactions that need attention
  async getPendingTransactions(
    olderThanMinutes: number = 5
  ): Promise<TransactionApiResponse<Transaction[]>> {
    const authError = this.checkAuth<Transaction[]>();
    if (authError) return authError;

    const endpoint = `/admin/transactions/pending?olderThanMinutes=${olderThanMinutes}`;
    return this.makeRequest<Transaction[]>(endpoint, {
      method: "GET",
    });
  }

  // Get transaction by ID with details
  async getTransactionById(
    transactionId: string
  ): Promise<TransactionApiResponse<TransactionDetail>> {
    const authError = this.checkAuth<TransactionDetail>();
    if (authError) return authError;

    const endpoint = `/admin/transactions/${transactionId}`;
    return this.makeRequest<TransactionDetail>(endpoint, {
      method: "GET",
    });
  }
}
