/**
 * Admin Validators API Service
 */

import {
  ValidatorApiResponse,
  Validator,
  ValidatorFilters,
  PaginatedValidatorsResponse,
  CreateValidatorRequest,
  UpdateValidatorRequest,
  UpdateValidatorStatusRequest,
  VALIDATOR_CONFIG,
} from "./types";

export class ValidatorService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = VALIDATOR_CONFIG.baseUrl;
    this.timeout = VALIDATOR_CONFIG.timeout;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ValidatorApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = this.getStoredToken();
    if (token) defaultHeaders["Authorization"] = `Bearer ${token}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    return {
      success: response.ok,
      message: data.message,
      data: (data.data as T) ?? (data as T),
      error: response.ok ? undefined : data.error,
    } as ValidatorApiResponse<T>;
  }

  // Token helper
  private getStoredToken(): string | null {
    return (
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  }

  // Get all validators with filters and pagination
  async getValidators(filters?: ValidatorFilters): Promise<ValidatorApiResponse<PaginatedValidatorsResponse>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status) params.append("status", filters.status);

    const endpoint = `/admin/validators${params.toString() ? `?${params.toString()}` : ""}`;
    return this.makeRequest<PaginatedValidatorsResponse>(endpoint, {
      method: "GET",
    });
  }

  // Get validator by ID
  async getValidatorById(id: string): Promise<ValidatorApiResponse<Validator>> {
    const endpoint = `/admin/validators/${id}`;
    return this.makeRequest<Validator>(endpoint, {
      method: "GET",
    });
  }

  // Create validator
  async createValidator(request: CreateValidatorRequest): Promise<ValidatorApiResponse<Validator>> {
    return this.makeRequest<Validator>("/admin/validators", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Update validator
  async updateValidator(id: string, request: UpdateValidatorRequest): Promise<ValidatorApiResponse<Validator>> {
    const endpoint = `/admin/validators/${id}`;
    return this.makeRequest<Validator>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }

  // Update validator status
  async updateValidatorStatus(id: string, request: UpdateValidatorStatusRequest): Promise<ValidatorApiResponse<Validator>> {
    const endpoint = `/admin/validators/${id}/status`;
    return this.makeRequest<Validator>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  }
}

