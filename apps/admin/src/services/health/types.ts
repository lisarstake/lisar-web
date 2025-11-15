/**
 * Admin Health API Types
 */

import { env } from '@/lib/env'

// Base API Response
export interface HealthApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// External Services Health Status
export interface ExternalServicesHealth {
  onramp: string; // "unknown" | "ok" | etc.
  privy: string;
  subgraph: string;
  supabase: string;
}

// Admin Panel Health Check Response
export interface AdminPanelHealth {
  success: boolean;
  message: string;
  timestamp: string;
  version: string;
}

// API Configuration
export interface HealthConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const HEALTH_CONFIG: HealthConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
}

