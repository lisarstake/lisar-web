/**
 * KYC API Types
 */

import { env } from '@/lib/env'

// Base API Response
export interface KycApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}

// KYC Status Types
export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired';
export type KycTier = 'tier_1' | 'tier_2' | 'tier_3' | null;
export type KycProvider = 'didit' | null;

// KYC Status Response
export interface KycStatusData {
  status: KycStatus;
  tier: KycTier;
  provider: KycProvider;
}

// Start KYC Request
export interface StartKycRequest {
  tier: 'tier_1' | 'tier_2' | 'tier_3';
}

// Start KYC Response
export interface StartKycData {
  kycId: string;
  sessionUrl: string;
  sessionId: string;
  expiresAt: string;
}

// KYC Session Response
export interface KycSessionData {
  kycId: string;
  sessionUrl: string;
  sessionId: string;
  status: KycStatus;
  tier: KycTier;
  provider: KycProvider;
  createdAt: string;
}

// KYC Details Response
export interface KycDetailsData {
  kycId: string;
  status: KycStatus;
  tier: KycTier;
  provider: KycProvider;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  expiresAt?: string;
  rejectionReason?: string;
  verificationData?: {
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    documentType?: string;
    documentNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };
}

// API Configuration
export interface KycConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

// Constants
export const KYC_CONFIG: KycConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3
};
