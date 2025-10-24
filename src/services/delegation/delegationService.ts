/**
 * Delegation API Service
 * Real implementation for delegation operations
 */

import { IDelegationApiService } from './api';
import {
  DelegationApiResponse,
  OrchestratorResponse,
  DELEGATION_CONFIG
} from './types';
import { http } from '@/lib/http';

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
    let token = localStorage.getItem('auth_token');
    
    // Check if token has expired (if rememberMe was used)
    const expiry = localStorage.getItem('auth_expiry');
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
      token = sessionStorage.getItem('auth_token');
    }
    
    return token;
  }

  private removeStoredTokens(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_expiry');
    sessionStorage.removeItem('auth_token');
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
        'Content-Type': 'application/json',
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
        message: response.data.message || 'Success',
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as T,
        message: error.response?.data?.message || 'An error occurred',
        error: error.response?.data?.error || error.message || 'Unknown error',
      };
    }
  }

  // Orchestrators
  async getOrchestrators(): Promise<DelegationApiResponse<OrchestratorResponse[]>> {
    return this.makeRequest<OrchestratorResponse[]>('/orchestrator', {
      method: 'GET',
    });
  }
}
