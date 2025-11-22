/**
 * TOTP Service Index
 * Centralized export for TOTP (2FA) services
 */

export * from './types';
export * from './api';
export * from './totpService';

// Export the service instance
import { TotpService } from './totpService';
export const totpService = new TotpService();

