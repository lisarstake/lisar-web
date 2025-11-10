/**
 * Admin Validators API Types
 */

import { env } from '@/lib/env'

// Base API Response
export interface ValidatorApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Validator Model
export interface Validator {
  id: string;
  address: string;
  name: string;
  protocol: string;
  fee_pct: number;
  apy: number;
  total_delegated_lisar: number;
  is_active: boolean;
  created_date: string;
  updated_date: string;
}

// Paginated Validators Response
export interface PaginatedValidatorsResponse {
  validators: Validator[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Validator Filters
export interface ValidatorFilters {
  page?: number;
  limit?: number;
  status?: "active" | "inactive";
}

// Create Validator Request
export interface CreateValidatorRequest {
  name: string;
  address: string;
  protocol: string;
  fee_pct: number;
  apy: number;
}

// Update Validator Request
export interface UpdateValidatorRequest {
  name?: string;
  fee_pct?: number;
  apy?: number;
  protocol?: string;
}

// Update Validator Status Request
export interface UpdateValidatorStatusRequest {
  isActive: boolean;
}

// API Configuration
export interface ValidatorConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const VALIDATOR_CONFIG: ValidatorConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 30000,
  retryAttempts: 3,
};

