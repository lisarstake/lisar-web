/**
 * Delegation API Service
 * Real implementation for delegation operations
 */

import { IDelegationApiService } from "./api";
import {
  DelegationApiResponse,
  OrchestratorResponse,
  StakeRequest,
  StakeResponse,
  UnbondRequest,
  UnbondResponse,
  DelegationResponse,
  DELEGATION_CONFIG,
} from "./types";
import { http } from "@/lib/http";

export class DelegationService implements IDelegationApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = DELEGATION_CONFIG.baseUrl;
    this.timeout = DELEGATION_CONFIG.timeout;
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

    // Log token for API testing
    console.log("🔑 Delegation Service Token:", token);

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
  ): Promise<DelegationApiResponse<T>> {
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

  // Orchestrators
  async getOrchestrators(): Promise<
    DelegationApiResponse<OrchestratorResponse[]>
  > {
    return this.makeRequest<OrchestratorResponse[]>("/orchestrator", {
      method: "GET",
    });
  }

  // Stake tokens to an orchestrator
  async stake(request: StakeRequest): Promise<StakeResponse> {
    try {
      const token = this.getStoredToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await http.request({
        url: `${this.baseUrl}/delegation/stake`,
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
          transactionHash: "",
          blockNumber: "",
        },
      };
    }
  }

  // Unbond tokens from an orchestrator
  async unbond(request: UnbondRequest): Promise<UnbondResponse> {
    try {
      const token = this.getStoredToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await http.request({
        url: `${this.baseUrl}/delegation/unbond`,
        method: "POST",
        headers,
        data: request,
        timeout: this.timeout,
      });

      return {
        success: true,
        txHash: response.data.txHash,
      };
    } catch (error: any) {
      return {
        success: false,
        txHash: "",
      };
    }
  }

  // Get delegations for a delegator
  async getDelegations(delegatorAddress: string): Promise<DelegationResponse> {
    try {
      const token = this.getStoredToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await http.request({
        url: `${this.baseUrl}/delegation/${delegatorAddress}`,
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
          bondedAmount: "0",
          delegate: {
            active: false,
            feeShare: "0",
            id: "",
            rewardCut: "0",
            status: "Not Registered",
            totalStake: "0",
          },
          delegatedAmount: "0",
          fees: "0",
          id: delegatorAddress,
          lastClaimRound: { id: "0" },
          principal: "0",
          startRound: "0",
          unbonded: "0",
          unbondingLocks: [],
          withdrawnFees: "0",
        },
      };
    }
  }
}
