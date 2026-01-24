/**
 * System Notification Service Index
 * Centralized export for system notification services
 */

export * from './types';
export * from './api';
export * from './systemNotificationService';

// Export the service instance
import { SystemNotificationService } from './systemNotificationService';
export const systemNotificationService = new SystemNotificationService();
