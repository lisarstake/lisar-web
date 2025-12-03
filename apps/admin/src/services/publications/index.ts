/**
 * Publications Service Exports
 */

export { PublicationService } from './publicationService';
export { IPublicationApiService } from './api';
export * from './types';
export { mockBlogPosts, mockBlogCategories } from './mockData';

// Create and export a singleton instance
import { PublicationService } from './publicationService';
export const publicationService = new PublicationService();
