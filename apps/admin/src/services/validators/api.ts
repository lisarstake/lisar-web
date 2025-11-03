/**
 * Validator API Service Interface
 * Defines the contract for validator-related API operations
 */

import {
  ValidatorApiResponse,
  Validator,
  ValidatorFilters,
  PaginatedValidatorsResponse,
  CreateValidatorRequest,
  UpdateValidatorRequest,
  UpdateValidatorStatusRequest,
} from './types';

export interface IValidatorApiService {
  // Validator operations
  getValidators(filters?: ValidatorFilters): Promise<ValidatorApiResponse<PaginatedValidatorsResponse>>;
  getValidatorById(id: string): Promise<ValidatorApiResponse<Validator>>;
  createValidator(request: CreateValidatorRequest): Promise<ValidatorApiResponse<Validator>>;
  updateValidator(id: string, request: UpdateValidatorRequest): Promise<ValidatorApiResponse<Validator>>;
  updateValidatorStatus(id: string, request: UpdateValidatorStatusRequest): Promise<ValidatorApiResponse<Validator>>;
}

