/**
 * Maple Service Index
 * Centralized export for maple-related services
 */

// Export types
export * from './types';

// Export API interface
export * from './api';

// Export service implementation
export { MapleService } from './mapleService';

// Create and export service instance
import { MapleService } from './mapleService';

export const mapleService = new MapleService();

