/**
 * ENS API Service Interface
 * Defines the contract for ENS-related API operations
 */

import {
  EnsApiResponse,
  EnsIdentity
} from './types';

export interface IEnsApiService {
  // Get ENS identity for a single address or ENS name
  getEnsIdentity(addressOrEns: string): Promise<EnsApiResponse<EnsIdentity>>;
  
  // Batch fetch ENS identities for multiple addresses
  getBatchEnsIdentities(
    addressesOrEns: string[]
  ): Promise<Record<string, EnsIdentity>>;
}

