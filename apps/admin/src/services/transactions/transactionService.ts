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
} from "./types";
import { ITransactionApiService } from "./api";

export class TransactionService implements ITransactionApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = TRANSACTION_CONFIG.baseUrl;
    this.timeout = TRANSACTION_CONFIG.timeout;
  }

  // Helper method for making HTTP requests
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

  // Token helper
  private getStoredToken(): string | null {
    return (
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  }

  // Get dashboard summary
  async getDashboardSummary(): Promise<TransactionApiResponse<DashboardSummary>> {
    return this.makeRequest<DashboardSummary>("/admin/dashboard/summary", {
      method: "GET",
    });
  }

  // Get transactions list
  async getTransactions(limit: number = 10): Promise<TransactionApiResponse<Transaction[]>> {
    const endpoint = `/admin/dashboard/transactions?limit=${limit}`;
    return this.makeRequest<Transaction[]>(endpoint, {
      method: "GET",
    });
  }

  // Get all transactions with filters and pagination
  async getAllTransactions(filters?: TransactionFilters): Promise<TransactionApiResponse<PaginatedTransactionsResponse>> {
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
  async getTransactionStats(): Promise<TransactionApiResponse<TransactionStats>> {
    return this.makeRequest<TransactionStats>("/admin/transactions/stats", {
      method: "GET",
    });
  }

  // Get failed transactions
  async getFailedTransactions(limit: number = 10): Promise<TransactionApiResponse<Transaction[]>> {
    const endpoint = `/admin/transactions/failed?limit=${limit}`;
    return this.makeRequest<Transaction[]>(endpoint, {
      method: "GET",
    });
  }

  // Get pending transactions that need attention
  async getPendingTransactions(olderThanMinutes: number = 5): Promise<TransactionApiResponse<Transaction[]>> {
    const endpoint = `/admin/transactions/pending?olderThanMinutes=${olderThanMinutes}`;
    return this.makeRequest<Transaction[]>(endpoint, {
      method: "GET",
    });
  }

  // Get transaction by ID with details
  async getTransactionById(transactionId: string): Promise<TransactionApiResponse<TransactionDetail>> {
    const endpoint = `/admin/transactions/${transactionId}`;
    return this.makeRequest<TransactionDetail>(endpoint, {
      method: "GET",
    });
  }
}

