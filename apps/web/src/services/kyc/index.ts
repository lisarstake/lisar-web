/**
 * KYC Service Index
 * Centralized export for KYC services
 */

export * from './types';
export * from './api';
export * from './kycService';

// Export the service instance
import { KycService } from './kycService';
export const kycService = new KycService();
