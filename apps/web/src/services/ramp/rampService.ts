/**
 * Ramp API Service
 * Real implementation for ramp operations
 */

import { IRampApiService } from "./api";
import {
  RampApiResponse,
  OrderData,
  CreateBuyOrderRequest,
  CreateSellOrderRequest,
  BankInfo,
  BankLookupRequest,
  AccountLookupResponse,
  RAMP_CONFIG,
} from "./types";
import { http } from "@/lib/http";
import { env } from "@/lib/env";

export class RampService implements IRampApiService {
  private baseUrl: string;
  private timeout: number;
  private apiKey: string;

  constructor() {
    this.baseUrl = RAMP_CONFIG.baseUrl;
    this.timeout = RAMP_CONFIG.timeout;
    this.apiKey = env.VITE_RAMP_API_KEY;
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
    };
  }

  // Create buy order (Fiat to Crypto)
  async createBuyOrder(
    request: CreateBuyOrderRequest,
  ): Promise<RampApiResponse<OrderData>> {
    try {
      const response = await http.request({
        url: `${this.baseUrl}/orders/buy`,
        method: "POST",
        headers: this.getHeaders(),
        data: request,
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            error.message ||
            "Failed to create buy order",
        },
      };
    }
  }

  // Create sell order (Crypto to Fiat)
  async createSellOrder(
    request: CreateSellOrderRequest,
  ): Promise<RampApiResponse<OrderData>> {
    try {
      const response = await http.request({
        url: `${this.baseUrl}/orders/sell`,
        method: "POST",
        headers: this.getHeaders(),
        data: request,
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            error.message ||
            "Failed to create sell order",
        },
      };
    }
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<RampApiResponse<OrderData>> {
    try {
      const response = await http.request({
        url: `${this.baseUrl}/orders/${orderId}`,
        method: "GET",
        headers: this.getHeaders(),
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            error.message ||
            "Failed to fetch order",
        },
      };
    }
  }
  // Get supported banks
  async getBanks(): Promise<RampApiResponse<BankInfo[]>> {
    try {
      const response = await http.request({
        url: `${this.baseUrl}/accounts/banks`,
        method: "GET",
        headers: this.getHeaders(),
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            error.message ||
            "Failed to fetch banks",
        },
      };
    }
  }

  // Lookup account name by account number and bank code
  async lookupAccount(
    request: BankLookupRequest,
  ): Promise<RampApiResponse<AccountLookupResponse>> {
    try {
      const response = await http.request({
        url: `${this.baseUrl}/accounts/bank/lookup`,
        method: "POST",
        headers: this.getHeaders(),
        data: request,
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            error.message ||
            "Failed to lookup account",
        },
      };
    }
  }
}
