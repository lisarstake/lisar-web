/**
 * Virtual Account API Service
 * Real implementation for virtual account operations
 */

import { http } from "@/lib/http";
import { env } from "@/lib/env";
import { IVirtualAccountApiService } from "./api";
import {
  BankAccountLookupRequest,
  BankAccountLookupResponse,
  CreateVirtualAccountRequest,
  NairaBalance,
  SupportedBank,
  TransactionDetails,
  TransactionHistoryQuery,
  TransactionHistoryResponse,
  VirtualAccountApiResponse,
  VirtualAccountDetails,
  VIRTUAL_ACCOUNT_CONFIG,
  WithdrawRequest,
  WithdrawResponse,
} from "./types";

export class VirtualAccountService implements IVirtualAccountApiService {
  private baseUrl: string;
  private timeout: number;
  private apiKey: string;

  constructor() {
    this.baseUrl = VIRTUAL_ACCOUNT_CONFIG.baseUrl;
    this.timeout = VIRTUAL_ACCOUNT_CONFIG.timeout;
    this.apiKey = env.VITE_RAMP_API_KEY;
  }

  // Token management helpers
  private getStoredToken(): string | null {
    let token = localStorage.getItem("auth_token");

    const expiry = localStorage.getItem("auth_expiry");
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10) * 1000;
      if (Date.now() > expiryTime) {
        this.removeStoredTokens();
        return null;
      }
    }

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

  private getAuthHeaders(token: string) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-api-key": this.apiKey,
    };
  }

  private getErrorMessage(
    errorPayload: unknown,
    messagePayload: unknown,
    fallback: string,
  ): string {
    if (typeof errorPayload === "string" && errorPayload.trim()) {
      return errorPayload;
    }

    if (
      typeof errorPayload === "object" &&
      errorPayload !== null &&
      "message" in errorPayload &&
      typeof (errorPayload as { message?: unknown }).message === "string"
    ) {
      return (errorPayload as { message: string }).message;
    }

    if (typeof messagePayload === "string" && messagePayload.trim()) {
      return messagePayload;
    }

    return fallback;
  }

  private buildQueryParams(query?: TransactionHistoryQuery): string {
    if (!query) {
      return "";
    }

    const params = new URLSearchParams();

    if (query.limit !== undefined) {
      params.set("limit", String(query.limit));
    }
    if (query.offset !== undefined) {
      params.set("offset", String(query.offset));
    }
    if (query.type) {
      params.set("type", query.type);
    }
    if (query.status) {
      params.set("status", query.status);
    }
    if (query.startDate) {
      params.set("startDate", query.startDate);
    }
    if (query.endDate) {
      params.set("endDate", query.endDate);
    }

    const paramString = params.toString();
    return paramString ? `?${paramString}` : "";
  }

  private async request<T>(config: {
    url: string;
    method: "GET" | "POST";
    data?: unknown;
    errorMessage: string;
  }): Promise<VirtualAccountApiResponse<T>> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        error: {
          message: "No authentication token found",
        },
      };
    }

    try {
      const response = await http.request({
        url: `${this.baseUrl}${config.url}`,
        method: config.method,
        headers: this.getAuthHeaders(token),
        data: config.data,
        timeout: this.timeout,
      });

      if (response.data?.success === false) {
        return {
          success: false,
          error: {
            message: this.getErrorMessage(
              response.data?.error,
              response.data?.message,
              config.errorMessage,
            ),
          },
        };
      }

      return {
        success: true,
        data: response.data.data ?? response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: this.getErrorMessage(
            error.response?.data?.error,
            error.response?.data?.message || error.message,
            config.errorMessage,
          ),
        },
      };
    }
  }

  async createVirtualAccount(
    request: CreateVirtualAccountRequest,
  ): Promise<VirtualAccountApiResponse<VirtualAccountDetails>> {
    return this.request<VirtualAccountDetails>({
      url: "/account/virtual-account",
      method: "POST",
      data: request,
      errorMessage: "Failed to create virtual account",
    });
  }

  async getVirtualAccount(): Promise<
    VirtualAccountApiResponse<VirtualAccountDetails>
  > {
    return this.request<VirtualAccountDetails>({
      url: "/account/virtual-account",
      method: "GET",
      errorMessage: "Failed to fetch virtual account",
    });
  }

  async getBalance(): Promise<VirtualAccountApiResponse<NairaBalance>> {
    return this.request<NairaBalance>({
      url: "/account/balance",
      method: "GET",
      errorMessage: "Failed to fetch Naira balance",
    });
  }

  async getBanks(): Promise<VirtualAccountApiResponse<SupportedBank[]>> {
    return this.request<SupportedBank[]>({
      url: "/account/banks",
      method: "GET",
      errorMessage: "Failed to fetch supported banks",
    });
  }

  async lookupAccount(
    request: BankAccountLookupRequest,
  ): Promise<VirtualAccountApiResponse<BankAccountLookupResponse>> {
    return this.request<BankAccountLookupResponse>({
      url: "/account/lookup",
      method: "POST",
      data: request,
      errorMessage: "Failed to lookup account",
    });
  }

  async withdraw(
    request: WithdrawRequest,
  ): Promise<VirtualAccountApiResponse<WithdrawResponse>> {
    return this.request<WithdrawResponse>({
      url: "/account/withdraw",
      method: "POST",
      data: request,
      errorMessage: "Failed to initiate withdrawal",
    });
  }

  async getTransactions(
    query?: TransactionHistoryQuery,
  ): Promise<VirtualAccountApiResponse<TransactionHistoryResponse>> {
    return this.request<TransactionHistoryResponse>({
      url: `/account/transactions${this.buildQueryParams(query)}`,
      method: "GET",
      errorMessage: "Failed to fetch transaction history",
    });
  }

  async getTransactionByReference(
    reference: string,
  ): Promise<VirtualAccountApiResponse<TransactionDetails>> {
    return this.request<TransactionDetails>({
      url: `/account/transactions/${encodeURIComponent(reference)}`,
      method: "GET",
      errorMessage: "Failed to fetch transaction",
    });
  }
}
