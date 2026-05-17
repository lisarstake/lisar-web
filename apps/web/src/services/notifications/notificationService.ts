/**
 * Notifications API Service
 * Real implementation for notification operations
 */

import { INotificationApiService } from "./api";
import {
  NotificationApiResponse,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
  ReadAllResponse,
  GetNotificationsRequest,
  GetSystemNotificationsRequest,
  MarkNotificationReadRequest,
  DeleteNotificationRequest,
  SystemNotification,
  NOTIFICATION_CONFIG,
} from "./types";
import { getStoredToken, http } from "@/lib/http";

export class NotificationService implements INotificationApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = NOTIFICATION_CONFIG.baseUrl;
    this.timeout = NOTIFICATION_CONFIG.timeout;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    config: any = {}
  ): Promise<NotificationApiResponse<T>> {
    try {
      // Add authorization header if token exists
      const token = getStoredToken();
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...config.headers,
      };

      const response = await http.request({
        url: `${this.baseUrl}${endpoint}`,
        timeout: this.timeout,
        headers,
        ...config,
      });

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Success",
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as T,
        message: error.response?.data?.message || error.response?.data?.error || "An error occurred",
        error: error.response?.data?.error || error.message || "Unknown error",
      };
    }
  }

  /**
   * Get all notifications for authenticated user
   */
  async getNotifications(
    request: GetNotificationsRequest = {}
  ): Promise<NotificationApiResponse<PaginatedNotificationsResponse>> {
    const { limit = 50, offset = 0 } = request;
    const endpoint = `/notifications?limit=${limit}&offset=${offset}`;
    return this.makeRequest<PaginatedNotificationsResponse>(endpoint, {
      method: "GET",
    });
  }

  /**
   * Get active system notifications
   */
  async getSystemNotifications(
    request: GetSystemNotificationsRequest = {}
  ): Promise<NotificationApiResponse<SystemNotification[]>> {
    const { limit = 10 } = request;
    const endpoint = `/notifications/system?limit=${limit}`;
    return this.makeRequest<SystemNotification[]>(endpoint, {
      method: "GET",
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<NotificationApiResponse<UnreadCountResponse>> {
    return this.makeRequest<UnreadCountResponse>("/notifications/unread-count", {
      method: "GET",
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<NotificationApiResponse<ReadAllResponse>> {
    return this.makeRequest<ReadAllResponse>("/notifications/read-all", {
      method: "PATCH",
    });
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(
    request: MarkNotificationReadRequest
  ): Promise<NotificationApiResponse<{}>> {
    return this.makeRequest<{}>(`/notifications/${request.id}/read`, {
      method: "PATCH",
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(
    request: DeleteNotificationRequest
  ): Promise<NotificationApiResponse<{}>> {
    return this.makeRequest<{}>(`/notifications/${request.id}`, {
      method: "DELETE",
    });
  }
}
