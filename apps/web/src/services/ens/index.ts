/**
 * ENS Service Index
 * Centralized export for ENS services
 */

// Export types
export * from './types';

// Export API interface
export * from './api';

// Export service implementation
export { EnsService } from './ensService';

// Create and export service instance
import { EnsService } from './ensService';

export const ensService = new EnsService();

