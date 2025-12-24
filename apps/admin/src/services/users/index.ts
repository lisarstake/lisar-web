/**
 * User Service Index
 * Centralized export for user services
 */

export * from './types';
export * from './api';
export * from './userService';

// Export the service instance
import { UserService } from './userService';
export const userService = new UserService();

