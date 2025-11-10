/**
 * Health Service Index
 * Centralized export for health services
 */

export * from './types';
export * from './api';
export * from './healthService';

// Export the service instance
import { HealthService } from './healthService';
export const healthService = new HealthService();

