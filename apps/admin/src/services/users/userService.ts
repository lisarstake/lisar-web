/**
 * Admin Users API Service
 */

import {
  UserApiResponse,
  User,
  UserStats,
  UserFilters,
  PaginatedUsersResponse,
  UserDetail,
  SuspendUserRequest,
  UpdateUserBalanceRequest,
  USER_CONFIG,
} from "./types";
import { IUserApiService } from "./api";

export class UserService implements IUserApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = USER_CONFIG.baseUrl;
    this.timeout = USER_CONFIG.timeout;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<UserApiResponse<T>> {
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
    } as UserApiResponse<T>;
  }

  // Token helper
  private getStoredToken(): string | null {
    return (
      localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
    );
  }

  // Get user statistics
  async getUserStats(): Promise<UserApiResponse<UserStats>> {
    const endpoint = "/admin/users/stats";
    return this.makeRequest<UserStats>(endpoint, {
      method: "GET",
    });
  }

  // Get all users with filters and pagination
  async getUsers(filters?: UserFilters): Promise<UserApiResponse<PaginatedUsersResponse>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status) params.append("status", filters.status);
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    const endpoint = `/admin/users${params.toString() ? `?${params.toString()}` : ""}`;
    return this.makeRequest<PaginatedUsersResponse>(endpoint, {
      method: "GET",
    });
  }

  // Get user by ID
  async getUserById(userId: string): Promise<UserApiResponse<UserDetail>> {
    const endpoint = `/admin/users/${userId}`;
    return this.makeRequest<UserDetail>(endpoint, {
      method: "GET",
    });
  }

  // Suspend user
  async suspendUser(userId: string, request: SuspendUserRequest): Promise<UserApiResponse<void>> {
    const endpoint = `/admin/users/${userId}/suspend`;
    return this.makeRequest<void>(endpoint, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  // Unsuspend user
  async unsuspendUser(userId: string): Promise<UserApiResponse<void>> {
    const endpoint = `/admin/users/${userId}/unsuspend`;
    return this.makeRequest<void>(endpoint, {
      method: "POST",
    });
  }

  // Update user balance
  async updateUserBalance(userId: string, request: UpdateUserBalanceRequest): Promise<UserApiResponse<void>> {
    const endpoint = `/admin/users/${userId}/balance`;
    return this.makeRequest<void>(endpoint, {
      method: "PUT",
      body: JSON.stringify(request),
    });
  }
}

