/**
 * PAJ Ramp API Service
 * Real implementation for paj-ramp operations
 */

import { http } from "@/lib/http";
import { env } from "@/lib/env";
import { IPajRampApiService } from "./api";
import {
  AddBankAccountRequest,
  AmountRateData,
  CreateOffRampOrderRequest,
  CreateOnRampOrderRequest,
  OffRampOrderData,
  OnRampOrderData,
  PAJ_RAMP_CONFIG,
  PajRampApiResponse,
  RampBank,
  RampTransaction,
  RatesData,
  ResolveBankAccountData,
  ResolveBankAccountRequest,
  SavedBankAccount,
  SessionInitiateData,
  SessionInitiateRequest,
  SessionStatusData,
  SessionVerifyData,
  SessionVerifyRequest,
} from "./types";

export class PajRampService implements IPajRampApiService {
  private baseUrl: string;
  private timeout: number;
  private apiKey: string;

  constructor() {
    this.baseUrl = PAJ_RAMP_CONFIG.baseUrl;
    this.timeout = PAJ_RAMP_CONFIG.timeout;
    this.apiKey = env.VITE_RAMP_API_KEY;
  }

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

  private getHeaders(token?: string) {
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(this.apiKey ? { "x-api-key": this.apiKey } : {}),
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

  private async request<T>(config: {
    url: string;
    method: "GET" | "POST";
    data?: unknown;
    errorMessage: string;
    authRequired?: boolean;
  }): Promise<PajRampApiResponse<T>> {
    const token = this.getStoredToken();

    if (config.authRequired && !token) {
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
        headers: this.getHeaders(token || undefined),
        data: config.data,
        timeout: this.timeout,
      });

      if (response.data?.success === false) {
        return {
          success: false,
          message: response.data?.message,
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
        message: response.data?.message,
        data: response.data?.data ?? response.data,
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

  async initiateSession(
    request: SessionInitiateRequest,
  ): Promise<PajRampApiResponse<SessionInitiateData>> {
    return this.request<SessionInitiateData>({
      url: "/ramp/session/initiate",
      method: "POST",
      data: request,
      errorMessage: "Failed to initiate PAJ Ramp session",
      authRequired: false,
    });
  }

  async verifySession(
    request: SessionVerifyRequest,
  ): Promise<PajRampApiResponse<SessionVerifyData>> {
    return this.request<SessionVerifyData>({
      url: "/ramp/session/verify",
      method: "POST",
      data: request,
      errorMessage: "Failed to verify PAJ Ramp session",
      authRequired: false,
    });
  }

  async getSessionStatus(): Promise<PajRampApiResponse<SessionStatusData>> {
    return this.request<SessionStatusData>({
      url: "/ramp/session/status",
      method: "GET",
      errorMessage: "Failed to fetch PAJ Ramp session status",
      authRequired: true,
    });
  }

  async getRates(): Promise<PajRampApiResponse<RatesData>> {
    return this.request<RatesData>({
      url: "/ramp/rates",
      method: "GET",
      errorMessage: "Failed to fetch PAJ Ramp rates",
      authRequired: true,
    });
  }

  async getRateByAmount(
    amount: number,
  ): Promise<PajRampApiResponse<AmountRateData>> {
    return this.request<AmountRateData>({
      url: `/ramp/rates/${encodeURIComponent(String(amount))}`,
      method: "GET",
      errorMessage: "Failed to fetch PAJ Ramp rate",
      authRequired: true,
    });
  }

  async createOnRampOrder(
    request: CreateOnRampOrderRequest,
  ): Promise<PajRampApiResponse<OnRampOrderData>> {
    return this.request<OnRampOrderData>({
      url: "/ramp/onramp",
      method: "POST",
      data: request,
      errorMessage: "Failed to create onramp order",
      authRequired: true,
    });
  }

  async getBanks(): Promise<PajRampApiResponse<RampBank[]>> {
    return this.request<RampBank[]>({
      url: "/ramp/banks",
      method: "GET",
      errorMessage: "Failed to fetch banks",
      authRequired: true,
    });
  }

  async resolveBankAccount(
    request: ResolveBankAccountRequest,
  ): Promise<PajRampApiResponse<ResolveBankAccountData>> {
    return this.request<ResolveBankAccountData>({
      url: "/ramp/banks/resolve",
      method: "POST",
      data: request,
      errorMessage: "Failed to resolve bank account",
      authRequired: true,
    });
  }

  async addBankAccount(
    request: AddBankAccountRequest,
  ): Promise<PajRampApiResponse<Record<string, unknown> | null>> {
    return this.request<Record<string, unknown> | null>({
      url: "/ramp/banks/add",
      method: "POST",
      data: request,
      errorMessage: "Failed to add bank account",
      authRequired: true,
    });
  }

  async getSavedBankAccounts(): Promise<PajRampApiResponse<SavedBankAccount[]>> {
    return this.request<SavedBankAccount[]>({
      url: "/ramp/banks/accounts",
      method: "GET",
      errorMessage: "Failed to fetch saved bank accounts",
      authRequired: true,
    });
  }

  async createOffRampOrder(
    request: CreateOffRampOrderRequest,
  ): Promise<PajRampApiResponse<OffRampOrderData>> {
    return this.request<OffRampOrderData>({
      url: "/ramp/offramp",
      method: "POST",
      data: request,
      errorMessage: "Failed to create offramp order",
      authRequired: true,
    });
  }

  async getTransactions(): Promise<PajRampApiResponse<RampTransaction[]>> {
    return this.request<RampTransaction[]>({
      url: "/ramp/transactions",
      method: "GET",
      errorMessage: "Failed to fetch ramp transactions",
      authRequired: true,
    });
  }

  async getTransactionById(
    id: string,
  ): Promise<PajRampApiResponse<RampTransaction>> {
    return this.request<RampTransaction>({
      url: `/ramp/transactions/${encodeURIComponent(id)}`,
      method: "GET",
      errorMessage: "Failed to fetch ramp transaction",
      authRequired: true,
    });
  }
}
