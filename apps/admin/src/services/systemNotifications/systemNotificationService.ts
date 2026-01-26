/**
 * Admin System Notifications API Service
 */

import {
  SystemNotificationApiResponse,
  SystemNotification,
  PaginatedSystemNotificationsResponse,
  CreateSystemNotificationRequest,
  UpdateSystemNotificationRequest,
  SystemNotificationFilters,
  SYSTEM_NOTIFICATION_CONFIG,
} from './types';
import { ISystemNotificationApiService } from './api';

export class SystemNotificationService implements ISystemNotificationApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = SYSTEM_NOTIFICATION_CONFIG.baseUrl;
    this.timeout = SYSTEM_NOTIFICATION_CONFIG.timeout;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<SystemNotificationApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getStoredToken();
    if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      return {
        success: response.ok,
        message: data.message,
        data: (data.data as T) ?? (data as T),
        error: response.ok ? undefined : (data.error || data.message),
      } as SystemNotificationApiResponse<T>;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An error occurred',
      };
    }
  }

  // Token helper
  private getStoredToken(): string | null {
    return (
      localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    );
  }

  // Helper to check authentication before making request
  private checkAuth<T>(): SystemNotificationApiResponse<T> | null {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: 'Not authenticated',
        data: null as unknown as T,
        error: 'No authentication token found',
      };
    }
    return null;
  }

  /**
   * Create a new system notification
   */
  async createSystemNotification(
    request: CreateSystemNotificationRequest
  ): Promise<SystemNotificationApiResponse<SystemNotification>> {
    const authError = this.checkAuth<SystemNotification>();
    if (authError) return authError;

    return this.makeRequest<SystemNotification>('/admin/notifications/system', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get paginated list of system notifications
   */
  async getSystemNotifications(
    filters?: SystemNotificationFilters
  ): Promise<SystemNotificationApiResponse<PaginatedSystemNotificationsResponse>> {
    const authError = this.checkAuth<PaginatedSystemNotificationsResponse>();
    if (authError) return authError;

    const params = new URLSearchParams();

    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const endpoint = `/admin/notifications/system${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest<PaginatedSystemNotificationsResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Update a system notification
   */
  async updateSystemNotification(
    id: string,
    request: UpdateSystemNotificationRequest
  ): Promise<SystemNotificationApiResponse<SystemNotification>> {
    const authError = this.checkAuth<SystemNotification>();
    if (authError) return authError;

    return this.makeRequest<SystemNotification>(
      `/admin/notifications/system/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Delete a system notification
   */
  async deleteSystemNotification(
    id: string
  ): Promise<SystemNotificationApiResponse<void>> {
    const authError = this.checkAuth<void>();
    if (authError) return authError;

    return this.makeRequest<void>(`/admin/notifications/system/${id}`, {
      method: 'DELETE',
    });
  }
}
