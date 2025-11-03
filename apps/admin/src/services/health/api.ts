/**
 * Health API Service Interface
 * Defines the contract for health-related API operations
 */

import {
  HealthApiResponse,
  ExternalServicesHealth,
  AdminPanelHealth,
} from './types';

export interface IHealthApiService {
  // Get health status of external services
  getDashboardHealth(): Promise<HealthApiResponse<ExternalServicesHealth>>;
  
  // Admin panel health check
  getAdminHealth(): Promise<HealthApiResponse<AdminPanelHealth>>;
}

