/**
 * Transaction API Service
 * Real implementation for transaction operations
 */

import { ITransactionApiService } from "./api";
import {
  TransactionApiResponse,
  TransactionData,
  TransactionType,
  CreateTransactionRequest,
  CreateTransactionResponse,
  UpdateTransactionStatusRequest,
  UpdateTransactionStatusResponse,
  TRANSACTION_CONFIG,
} from "./types";
import { http } from "@/lib/http";

export class TransactionService implements ITransactionApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = TRANSACTION_CONFIG.baseUrl;
    this.timeout = TRANSACTION_CONFIG.timeout;
  }

  // Token management helpers
  private getStoredToken(): string | null {
    // Check localStorage first (remembered sessions)
    let token = localStorage.getItem("auth_token");

    // Check if token has expired (if rememberMe was used)
    const expiry = localStorage.getItem("auth_expiry");
    if (token && expiry) {
      const expiryTime = parseInt(expiry) * 1000; // Convert to milliseconds
      if (Date.now() > expiryTime) {
        // Token expired, clear it
        this.removeStoredTokens();
        return null;
      }
    }

    // If not in localStorage, check sessionStorage
    if (!token) {
      token = sessionStorage.getItem("auth_token");
    }

    return token;
  }

  private removeStoredTokens(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expiry");
    sessionStorage.removeItem("auth_token");
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    config: any = {}
  ): Promise<TransactionApiResponse<T>> {
    try {
      // Add authorization header if token exists
      const token = this.getStoredToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
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
        count: response.data.count,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as T,
        message: error.response?.data?.message || "An error occurred",
        error: error.response?.data?.error || error.message || "Unknown error",
        count: 0,
      };
    }
  }

  // Get all transactions for a user
  async getUserTransactions(userId: string): Promise<TransactionApiResponse<TransactionData[]>> {
    return this.makeRequest<TransactionData[]>(`/transactions/user/${userId}`, {
      method: "GET",
    });
  }

  // Get a specific transaction by ID
  async getTransactionById(transactionId: string): Promise<TransactionApiResponse<TransactionData>> {
    return this.makeRequest<TransactionData>(`/transactions/${transactionId}`, {
      method: "GET",
    });
  }

  // Get user transactions by type
  async getUserTransactionsByType(
    userId: string, 
    type: TransactionType
  ): Promise<TransactionApiResponse<TransactionData[]>> {
    return this.makeRequest<TransactionData[]>(`/transactions/user/${userId}/type/${type}`, {
      method: "GET",
    });
  }

  // Create a new transaction
  async createTransaction(request: CreateTransactionRequest): Promise<CreateTransactionResponse> {
    try {
      const token = this.getStoredToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await http.request({
        url: `${this.baseUrl}/transactions`,
        method: "POST",
        headers,
        data: request,
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          id: "",
          user_id: request.user_id,
          transaction_hash: request.transaction_hash,
          transaction_type: request.transaction_type,
          amount: request.amount,
          token_address: request.token_address,
          token_symbol: request.token_symbol,
          wallet_address: request.wallet_address,
          wallet_id: request.wallet_id,
          status: request.status,
          source: request.source,
          svix_id: "",
          created_at: new Date().toISOString(),
        },
      };
    }
  }

  // Update transaction status
  async updateTransactionStatus(
    transactionId: string, 
    request: UpdateTransactionStatusRequest
  ): Promise<UpdateTransactionStatusResponse> {
    try {
      const token = this.getStoredToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await http.request({
        url: `${this.baseUrl}/transactions/${transactionId}/status`,
        method: "PATCH",
        headers,
        data: request,
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          id: transactionId,
          user_id: "",
          transaction_hash: "",
          transaction_type: "deposit",
          amount: "0",
          token_address: "",
          token_symbol: "",
          wallet_address: "",
          wallet_id: "",
          status: request.status,
          source: "",
          svix_id: "",
          created_at: new Date().toISOString(),
        },
      };
    }
  }
}
