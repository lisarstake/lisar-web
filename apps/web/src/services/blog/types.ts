import { BlogPost, BlogCategory } from '@/types/blog';
import { env } from '@/lib/env';

export interface GetBlogPostsParams {
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetBlogPostsResponse {
  success: boolean;
  data: {
    posts: BlogPost[];
    total: number;
    hasMore: boolean;
  };
  message?: string;
  error?: string;
}

export interface GetBlogPostResponse {
  success: boolean;
  data: BlogPost | null;
  message?: string;
  error?: string;
}

export interface GetBlogCategoriesResponse {
  success: boolean;
  data: BlogCategory[];
  message?: string;
  error?: string;
}

// API Configuration
export interface BlogConfig {
  baseUrl: string;
  timeout: number;
  useMockData: boolean; // Flag to switch between mock and real API
}

export const BLOG_CONFIG: BlogConfig = {
  baseUrl: env.VITE_API_BASE_URL,
  timeout: 30000,
  useMockData: import.meta.env.VITE_USE_MOCK_BLOG === 'true' || false, // Default to false (use real API)
};
