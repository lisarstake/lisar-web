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
  GetSystemNotificationsRequest,
  MarkNotificationReadRequest,
  DeleteNotificationRequest,
  SystemNotification,
} from './types';

export interface INotificationApiService {
  // Get all notifications for authenticated user
  getNotifications(request?: GetNotificationsRequest): Promise<NotificationApiResponse<PaginatedNotificationsResponse>>;
  
  // Get active system notifications
  getSystemNotifications(request?: GetSystemNotificationsRequest): Promise<NotificationApiResponse<SystemNotification[]>>;
  
  // Get unread notification count
  getUnreadCount(): Promise<NotificationApiResponse<UnreadCountResponse>>;
  
  // Mark all notifications as read
  markAllAsRead(): Promise<NotificationApiResponse<ReadAllResponse>>;
  
  // Mark a specific notification as read
  markAsRead(request: MarkNotificationReadRequest): Promise<NotificationApiResponse<{}>>;
  
  // Delete a notification
  deleteNotification(request: DeleteNotificationRequest): Promise<NotificationApiResponse<{}>>;
}

