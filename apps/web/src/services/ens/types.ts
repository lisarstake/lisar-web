/**
 * ENS API Types
 * Defines interfaces for ENS-related API operations
 */

import { env } from '@/lib/env'

// Base API Response
export interface EnsApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// ENS Identity Types
export type EnsIdentity = {
  id: string;
  idShort: string;
  avatar?: string | null;
  name?: string | null;
  url?: string | null;
  twitter?: string | null;
  github?: string | null;
  description?: string | null;
};

// Configuration
export interface EnsConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const ENS_CONFIG: EnsConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 30000,
  retryAttempts: 3,
};

