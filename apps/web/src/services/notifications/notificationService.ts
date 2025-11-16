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
  MarkNotificationReadRequest,
  DeleteNotificationRequest,
  NOTIFICATION_CONFIG,
} from "./types";
import { http } from "@/lib/http";

export class NotificationService implements INotificationApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = NOTIFICATION_CONFIG.baseUrl;
    this.timeout = NOTIFICATION_CONFIG.timeout;
  }

  // Token management helpers
  private getStoredToken(): string | null {
    // Check localStorage first (remembered sessions)
    let token = localStorage.getItem("auth_token");

    // Check if token has expired (if rememberMe was used)
    const expiry = localStorage.getItem("auth_expiry");
    if (token && expiry) {
      const expiryTime = parseInt(expiry) * 1000; // Convert to milliseconds
      if (Date.now() > expiryTime) {
        // Token expired, clear it
        this.removeStoredTokens();
        return null;
      }
    }

    // If not in localStorage, check sessionStorage
    if (!token) {
      token = sessionStorage.getItem("auth_token");
    }

    return token;
  }

  private removeStoredTokens(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expiry");
    sessionStorage.removeItem("auth_token");
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    config: any = {}
  ): Promise<NotificationApiResponse<T>> {
    try {
      // Add authorization header if token exists
      const token = this.getStoredToken();
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
        message: error.response?.data?.message || "An error occurred",
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

