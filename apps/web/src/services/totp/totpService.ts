/**
 * TOTP API Service
 * Real implementation for TOTP (2FA) operations
 */

import { ITotpApiService } from "./api";
import {
  TotpSetupResponse,
  TotpVerifyRequest,
  TotpVerifyResponse,
  TOTP_CONFIG,
} from "./types";
import { http } from "@/lib/http";

export class TotpService implements ITotpApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = TOTP_CONFIG.baseUrl;
    this.timeout = TOTP_CONFIG.timeout;
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

  // Generate TOTP secret and QR code for 2FA setup
  async setup(): Promise<TotpSetupResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        qr: "",
        otpauth_url: "",
      };
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await http.request({
        url: `${this.baseUrl}/totp/setup`,
        method: "GET",
        headers,
        timeout: this.timeout,
      });

      return {
        success: true,
        qr: response.data.qr,
        otpauth_url: response.data.otpauth_url,
      };
    } catch (error: any) {
      return {
        success: false,
        qr: "",
        otpauth_url: "",
      };
    }
  }

  // Verify TOTP code and enable 2FA
  async verify(request: TotpVerifyRequest): Promise<TotpVerifyResponse> {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        error: "Authentication required",
        message: "No authentication token found",
      };
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await http.request({
        url: `${this.baseUrl}/totp/verify`,
        method: "POST",
        headers,
        data: request,
        timeout: this.timeout,
      });

      return {
        success: true,
        message: response.data.message || "OTP verified successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Unknown error",
        message: error.response?.data?.message || "Failed to verify OTP code",
      };
    }
  }
}
