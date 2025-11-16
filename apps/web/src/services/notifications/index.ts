/**
 * Notifications Service Index
 * Centralized export for notification services
 */

// Export types
export * from './types';

// Export API interface
export * from './api';

// Export service implementation
export { NotificationService } from './notificationService';

// Create and export service instance
import { NotificationService } from './notificationService';

export const notificationService = new NotificationService();

