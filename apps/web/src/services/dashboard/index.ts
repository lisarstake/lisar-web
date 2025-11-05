/**
 * Dashboard Service Index
 * Centralized export for dashboard services
 */

// Export types
export * from './types';

// Export API interface
export * from './api';

// Export service implementation
export { DashboardService } from './dashboardService';

// Create and export service instance
import { DashboardService } from './dashboardService';

export const dashboardService = new DashboardService();

