/**
 * System Notification API Service Interface
 * Defines the contract for system notification-related API operations
 */

import {
  SystemNotificationApiResponse,
  SystemNotification,
  PaginatedSystemNotificationsResponse,
  CreateSystemNotificationRequest,
  UpdateSystemNotificationRequest,
  SystemNotificationFilters,
} from './types';

export interface ISystemNotificationApiService {
  /**
   * Create a new system notification
   * POST /admin/notifications/system
   */
  createSystemNotification(
    request: CreateSystemNotificationRequest
  ): Promise<SystemNotificationApiResponse<SystemNotification>>;

  /**
   * Get paginated list of system notifications
   * GET /admin/notifications/system
   */
  getSystemNotifications(
    filters?: SystemNotificationFilters
  ): Promise<SystemNotificationApiResponse<PaginatedSystemNotificationsResponse>>;

  /**
   * Update a system notification
   * PATCH /admin/notifications/system/:id
   */
  updateSystemNotification(
    id: string,
    request: UpdateSystemNotificationRequest
  ): Promise<SystemNotificationApiResponse<SystemNotification>>;

  /**
   * Delete a system notification
   * DELETE /admin/notifications/system/:id
   */
  deleteSystemNotification(
    id: string
  ): Promise<SystemNotificationApiResponse<void>>;
}
