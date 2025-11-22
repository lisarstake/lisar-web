/**
 * Gas Service Index
 * Centralized export for gas services
 */

export * from './types';
export * from './api';
export * from './gasService';

// Export the service instance
import { GasService } from './gasService';
export const gasService = new GasService();

