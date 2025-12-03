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
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Get Publications Params
export interface GetPublicationsParams extends BlogFilters {}

// Get Publication Stats Response
export interface GetPublicationStatsResponse {
  stats: BlogStats;
}

// Re-export types for convenience
export type { BlogPost, BlogCategory, BlogStats, CreateBlogPostData, UpdateBlogPostData };

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
  useMockData: import.meta.env.VITE_USE_MOCK_PUBLICATIONS === 'true' || true, // Default to false (use real API)
};
