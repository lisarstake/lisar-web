/**
 * Perena API Service
 * Real implementation for perena operations
 */

import { IPerenaApiService } from "./api";
import {
  GetPriceResponse,
  GetPriceApiResponse,
  GetApyResponse,
  QuoteResponse,
  GetStatsResponse,
  MintResponse,
  BurnResponse,
  MintQuoteRequest,
  BurnQuoteRequest,
  MintRequest,
  BurnRequest,
  PERENA_CONFIG,
} from "./types";
import { http } from "@/lib/http";

export class PerenaService implements IPerenaApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = PERENA_CONFIG.baseUrl;
    this.timeout = PERENA_CONFIG.timeout;
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

  // Get current USD* price
  async getPrice(): Promise<GetPriceResponse> {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await http.request({
        url: `${this.baseUrl}/perena/price`,
        method: "GET",
        headers,
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          price: 0,
          token: "",
          timestamp: "",
        },
        error: error.response?.data?.error || error.message || "Failed to fetch price",
      };
    }
  }

  // Get USDStar price from Perena API (with timestamp parameter)
  async getPriceApi(time?: string): Promise<GetPriceApiResponse> {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const currentTime = time || new Date().toISOString();
      const url = `${this.baseUrl}/perena/price-api?time=${encodeURIComponent(currentTime)}`;

      const response = await http.request({
        url,
        method: "GET",
        headers,
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          price: 0,
          timestamp: "",
        },
        error: error.response?.data?.error || error.message || "Failed to fetch price",
      };
    }
  }

  // Get USDStar APY from Perena API
  async getApy(time?: string): Promise<GetApyResponse> {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const currentTime = time || new Date().toISOString();
      const url = `${this.baseUrl}/perena/apy?time=${encodeURIComponent(currentTime)}`;

      const response = await http.request({
        url,
        method: "GET",
        headers,
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          period: "",
          apy: 0,
          timestamp: "",
        },
        error: error.response?.data?.error || error.message || "Failed to fetch APY",
      };
    }
  }

  // Get quote for minting USD*
  async getMintQuote(request: MintQuoteRequest): Promise<QuoteResponse> {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await http.request({
        url: `${this.baseUrl}/perena/quote/mint`,
        method: "POST",
        headers,
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
        data: {
          inputAmount: 0,
          outputAmount: 0,
          inputToken: "",
          outputToken: "",
          exchangeRate: 0,
          fee: 0,
        },
        error: error.response?.data?.error || error.message || "Failed to get mint quote",
      };
    }
  }

  // Get quote for burning USD*
  async getBurnQuote(request: BurnQuoteRequest): Promise<QuoteResponse> {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await http.request({
        url: `${this.baseUrl}/perena/quote/burn`,
        method: "POST",
        headers,
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
        data: {
          inputAmount: 0,
          outputAmount: 0,
          inputToken: "",
          outputToken: "",
          exchangeRate: 0,
          fee: 0,
        },
        error: error.response?.data?.error || error.message || "Failed to get burn quote",
      };
    }
  }

  // Get protocol statistics
  async getStats(): Promise<GetStatsResponse> {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await http.request({
        url: `${this.baseUrl}/perena/stats`,
        method: "GET",
        headers,
        timeout: this.timeout,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          usdStarPrice: 0,
          environment: "",
          cluster: "",
          rpcUrl: "",
        },
        error: error.response?.data?.error || error.message || "Failed to fetch stats",
      };
    }
  }

  // Mint USD* from USDC
  async mint(request: MintRequest): Promise<MintResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        data: {
          hash: "",
          expectedOutput: 0,
          inputAmount: 0,
          inputToken: "",
          outputToken: "",
        },
        error: "Authentication required",
      };
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await http.request({
        url: `${this.baseUrl}/perena/mint`,
        method: "POST",
        headers,
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
        data: {
          hash: "",
          expectedOutput: 0,
          inputAmount: 0,
          inputToken: "",
          outputToken: "",
        },
        error: error.response?.data?.error || error.message || "Failed to mint USD*",
      };
    }
  }

  // Burn USD* for USDC
  async burn(request: BurnRequest): Promise<BurnResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        data: {
          hash: "",
          expectedOutput: 0,
          inputAmount: 0,
          inputToken: "",
          outputToken: "",
        },
        error: "Authentication required",
      };
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await http.request({
        url: `${this.baseUrl}/perena/burn`,
        method: "POST",
        headers,
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
        data: {
          hash: "",
          expectedOutput: 0,
          inputAmount: 0,
          inputToken: "",
          outputToken: "",
        },
        error: error.response?.data?.error || error.message || "Failed to burn USD*",
      };
    }
  }
}

