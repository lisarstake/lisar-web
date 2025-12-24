/**
 * Delegation Service Index
 * Centralized export for delegation services
 */

export * from './types';
export * from './api';
export * from './delegationService';

// Export the service instance
import { DelegationService } from './delegationService';
export const delegationService = new DelegationService();
