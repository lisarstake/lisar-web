/**
 * Admin System Notifications API Types
 */

import { env } from '@/lib/env';

// Base API Response
export interface SystemNotificationApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// System Notification Type
export type SystemNotificationType = 'maintenance' | 'announcement' | 'alert' | 'info' | string;

// System Notification Metadata
export interface SystemNotificationMetadata {
  severity?: 'info' | 'warning' | 'error' | 'critical';
  [key: string]: any;
}

// System Notification Model
export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: SystemNotificationType;
  metadata?: SystemNotificationMetadata;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Create System Notification Request
export interface CreateSystemNotificationRequest {
  title: string;
  message: string;
  type: SystemNotificationType;
  metadata?: SystemNotificationMetadata;
  expires_at?: string;
}

// Update System Notification Request
export interface UpdateSystemNotificationRequest {
  title?: string;
  message?: string;
  type?: SystemNotificationType;
  metadata?: SystemNotificationMetadata;
  expires_at?: string;
}

// Paginated System Notifications Response
export interface PaginatedSystemNotificationsResponse {
  notifications: SystemNotification[];
  total: number;
  limit: number;
  offset: number;
}

// System Notification Filters
export interface SystemNotificationFilters {
  limit?: number;
  offset?: number;
}

// API Configuration
export interface SystemNotificationConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const SYSTEM_NOTIFICATION_CONFIG: SystemNotificationConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
};
