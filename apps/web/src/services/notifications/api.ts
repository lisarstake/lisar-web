/**
 * Notifications API Service Interface
 * Defines the contract for notification-related API operations
 */

import {
  NotificationApiResponse,
  Notification,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
  ReadAllResponse,
  GetNotificationsRequest,
  MarkNotificationReadRequest,
  DeleteNotificationRequest,
} from './types';

export interface INotificationApiService {
  // Get all notifications for authenticated user
  getNotifications(request?: GetNotificationsRequest): Promise<NotificationApiResponse<PaginatedNotificationsResponse>>;
  
  // Get unread notification count
  getUnreadCount(): Promise<NotificationApiResponse<UnreadCountResponse>>;
  
  // Mark all notifications as read
  markAllAsRead(): Promise<NotificationApiResponse<ReadAllResponse>>;
  
  // Mark a specific notification as read
  markAsRead(request: MarkNotificationReadRequest): Promise<NotificationApiResponse<{}>>;
  
  // Delete a notification
  deleteNotification(request: DeleteNotificationRequest): Promise<NotificationApiResponse<{}>>;
}

