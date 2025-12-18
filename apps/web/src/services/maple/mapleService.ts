/**
 * Maple API Service
 * Real implementation for maple operations
 */

import { IMapleApiService } from "./api";
import {
  GetPoolsResponse,
  GetPoolResponse,
  GetAuthorizationResponse,
  GetPositionsResponse,
  GetWithdrawalQueueResponse,
  ExecuteDepositRequest,
  ExecuteDepositResponse,
  ExecuteAuthorizedDepositRequest,
  ExecuteAuthorizedDepositResponse,
  RequestRedeemRequest,
  RequestRedeemResponse,
  MAPLE_CONFIG,
} from "./types";
import { http } from "@/lib/http";

export class MapleService implements IMapleApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = MAPLE_CONFIG.baseUrl;
    this.timeout = MAPLE_CONFIG.timeout;
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

  // Get all Syrup pools
  async getPools(): Promise<GetPoolsResponse> {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await http.request({
        url: `${this.baseUrl}/maple/syrup/pools`,
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
          pools: [],
          count: 0,
        },
        error: error.response?.data?.error || error.message || "Failed to fetch pools",
      };
    }
  }

  // Get Syrup pool by ID
  async getPool(poolId: string): Promise<GetPoolResponse> {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await http.request({
        url: `${this.baseUrl}/maple/syrup/pools/${poolId}`,
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
          id: "",
          name: "",
          asset: {
            symbol: "",
            decimals: 0,
          },
          syrupRouter: {
            id: "",
          },
          withdrawalManagerQueue: {
            id: "",
          },
          poolPermissionManager: {
            id: "",
          },
        },
        error: error.response?.data?.error || error.message || "Failed to fetch pool",
      };
    }
  }

  // Check user authorization for Syrup deposits
  async getAuthorization(walletAddress: string): Promise<GetAuthorizationResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        data: {
          walletAddress,
          isAuthorized: false,
          accountExists: false,
          message: "Authentication required",
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
        url: `${this.baseUrl}/maple/syrup/authorization/${walletAddress}`,
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
          walletAddress,
          isAuthorized: false,
          accountExists: false,
          message: error.response?.data?.error || error.message || "Failed to check authorization",
        },
        error: error.response?.data?.error || error.message || "Failed to check authorization",
      };
    }
  }

  // Get user's pool positions
  async getPositions(walletAddress: string, poolId: string): Promise<GetPositionsResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        data: {
          walletAddress,
          poolId,
          positions: [],
          hasPositions: false,
          message: "Authentication required",
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
        url: `${this.baseUrl}/maple/syrup/positions/${walletAddress}/${poolId}`,
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
          walletAddress,
          poolId,
          positions: [],
          hasPositions: false,
          message: error.response?.data?.error || error.message || "Failed to fetch positions",
        },
        error: error.response?.data?.error || error.message || "Failed to fetch positions",
      };
    }
  }

  // Get withdrawal queue status
  async getWithdrawalQueue(poolId: string): Promise<GetWithdrawalQueueResponse> {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      const response = await http.request({
        url: `${this.baseUrl}/maple/syrup/withdrawal-queue/${poolId}`,
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
          poolId,
          withdrawalQueue: {
            totalShares: "0.000000",
            totalSharesRaw: "0",
            nextRequest: null,
          },
          message: error.response?.data?.error || error.message || "Failed to fetch withdrawal queue",
        },
        error: error.response?.data?.error || error.message || "Failed to fetch withdrawal queue",
      };
    }
  }

  // Execute deposit for authorized users
  async executeDeposit(request: ExecuteDepositRequest): Promise<ExecuteDepositResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        data: {
          approvalTxHash: "",
          depositTxHash: "",
          amount: "",
          asset: "",
          depositData: "",
          message: "Authentication required",
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
        url: `${this.baseUrl}/maple/syrup/execute-deposit`,
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
          approvalTxHash: "",
          depositTxHash: "",
          amount: "",
          asset: "",
          depositData: "",
          message: error.response?.data?.error || error.message || "Failed to execute deposit",
        },
        error: error.response?.data?.error || error.message || "Failed to execute deposit",
      };
    }
  }

  // Execute authorized deposit for unauthorized users
  async executeAuthorizedDeposit(
    request: ExecuteAuthorizedDepositRequest
  ): Promise<ExecuteAuthorizedDepositResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        data: {
          approvalTxHash: "",
          depositTxHash: "",
          amount: "",
          asset: "",
          signature: {
            deadline: "",
            bitmap: "",
            r: "",
            s: "",
            v: 0,
          },
          depositData: "",
          message: "Authentication required",
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
        url: `${this.baseUrl}/maple/syrup/execute-authorized-deposit`,
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
          approvalTxHash: "",
          depositTxHash: "",
          amount: "",
          asset: "",
          signature: {
            deadline: "",
            bitmap: "",
            r: "",
            s: "",
            v: 0,
          },
          depositData: "",
          message: error.response?.data?.error || error.message || "Failed to execute authorized deposit",
        },
        error: error.response?.data?.error || error.message || "Failed to execute authorized deposit",
      };
    }
  }

  // Request withdrawal/redemption from Syrup pool
  async requestRedeem(request: RequestRedeemRequest): Promise<RequestRedeemResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        data: {
          txHash: "",
          poolAddress: "",
          shares: "",
          walletAddress: "",
          message: "Authentication required",
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
        url: `${this.baseUrl}/maple/syrup/request-redeem`,
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
          txHash: "",
          poolAddress: "",
          shares: "",
          walletAddress: "",
          message: error.response?.data?.error || error.message || "Failed to request redeem",
        },
        error: error.response?.data?.error || error.message || "Failed to request redeem",
      };
    }
  }
}

