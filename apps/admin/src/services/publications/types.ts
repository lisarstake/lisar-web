/**
 * Admin Publications API Types
 */

import { env } from '@/lib/env';
import { BlogPost, BlogCategory, BlogFilters, BlogStats, CreateBlogPostData, UpdateBlogPostData } from '@/types/blog';

// Base API Response
export interface PublicationApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Paginated Publications Response
export interface PaginatedPublicationsResponse {
  posts: BlogPost[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// Get Publications Params
export interface GetPublicationsParams extends BlogFilters {}

// Get Publication Stats Response
export interface GetPublicationStatsResponse extends BlogStats {
  // API returns stats directly, not wrapped in a stats property
}

// Re-export types for convenience
export type { BlogPost, BlogCategory, BlogStats, CreateBlogPostData, UpdateBlogPostData };

// Publication API Service Interface
export interface IPublicationApiService {
  // Publication operations
  getPublications(params?: GetPublicationsParams): Promise<PublicationApiResponse<PaginatedPublicationsResponse>>;
  getPublicationById(id: string): Promise<PublicationApiResponse<BlogPost>>;
  createPublication(data: CreateBlogPostData): Promise<PublicationApiResponse<BlogPost>>;
  updatePublication(data: UpdateBlogPostData): Promise<PublicationApiResponse<BlogPost>>;
  deletePublication(id: string): Promise<PublicationApiResponse<void>>;
  getPublicationStats(): Promise<PublicationApiResponse<GetPublicationStatsResponse>>;
  getCategories(): Promise<PublicationApiResponse<BlogCategory[]>>;
  createCategory(data: { name: string; slug: string; description?: string }): Promise<PublicationApiResponse<BlogCategory>>;
  updateCategory(id: string, data: { name: string; slug: string; description?: string }): Promise<PublicationApiResponse<BlogCategory>>;
}

// API Configuration
export interface PublicationConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  useMockData: boolean; // Flag to switch between mock and real API
}

export const PUBLICATION_CONFIG: PublicationConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 100000,
  retryAttempts: 3,
  useMockData: import.meta.env.VITE_USE_MOCK_PUBLICATIONS === 'true' || false, // Default to false (use real API)
};
