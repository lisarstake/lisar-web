/**
 * Validator Service Index
 * Centralized export for validator services
 */

export * from './types';
export * from './api';
export * from './validatorService';

// Export the service instance
import { ValidatorService } from './validatorService';
export const validatorService = new ValidatorService();

