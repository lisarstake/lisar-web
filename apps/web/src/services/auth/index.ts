/**
 * Authentication Service Index
 * Centralized export for auth services
 */

export * from './types';
export * from './api';
export * from './authService';

// Export the service instance
import { AuthService } from './authService';
export const authService = new AuthService();
