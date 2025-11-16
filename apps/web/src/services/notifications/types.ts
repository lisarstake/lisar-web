/**
 * Notifications API Types
 * Defines interfaces for notification-related API operations
 */

import { env } from '@/lib/env'

// Base API Response
export interface NotificationApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "reward" | "transaction" | "system" | "alert" | string;
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Paginated Notifications Response
export interface PaginatedNotificationsResponse {
  notifications: Notification[];
  total: number;
  limit: number;
  offset: number;
}

// Unread Count Response
export interface UnreadCountResponse {
  unread_count: number;
}

// Read All Response
export interface ReadAllResponse {
  updated_count: number;
}

// Request Types
export interface GetNotificationsRequest {
  limit?: number;
  offset?: number;
}

export interface MarkNotificationReadRequest {
  id: string;
}

export interface DeleteNotificationRequest {
  id: string;
}

// Configuration
export interface NotificationConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const NOTIFICATION_CONFIG: NotificationConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};

