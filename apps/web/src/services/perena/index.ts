/**
 * Perena Service Index
 * Centralized export for perena-related services
 */

// Export types
export * from './types';

// Export API interface
export * from './api';

// Export service implementation
export { PerenaService } from './perenaService';

// Create and export service instance
import { PerenaService } from './perenaService';

export const perenaService = new PerenaService();

