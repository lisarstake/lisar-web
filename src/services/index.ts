/**
 * API Service Factory
 * Centralized service management for easy switching between mock and real APIs
 */

import { IApiService } from './api';
import { MockApiService } from './mockApiService';

// Service configuration
const USE_MOCK_API = true; // Set to false when real API is ready

// Service factory
export const createApiService = (): IApiService => {
  if (USE_MOCK_API) {
    return new MockApiService();
  }
  
  // TODO: Implement real API service
  // return new RealApiService();
  
  // Fallback to mock for now
  return new MockApiService();
};

// Export the service instance
export const apiService = createApiService();

// Export types for use in components
export * from './types';
export * from './api';
