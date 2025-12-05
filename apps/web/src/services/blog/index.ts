/**
 * Blog Service Index
 * Centralized export for blog-related services
 */

// Export types
export * from './types';

// Export API interface
export * from './api';

// Export service implementation
export { BlogService } from './blogService';

// Create and export service instance
import { BlogService } from './blogService';

export const blogService = new BlogService();
