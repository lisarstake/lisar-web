/**
 * Delegation API Service Interface
 * Defines the contract for delegation-related API operations
 */

import {
  DelegationApiResponse,
  OrchestratorResponse
} from './types';

export interface IDelegationApiService {
  // Orchestrators
  getOrchestrators(): Promise<DelegationApiResponse<OrchestratorResponse[]>>;
}
