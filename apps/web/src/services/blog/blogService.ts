/**
 * Blog API Service
 */

import {
  GetBlogPostsParams,
  GetBlogPostsResponse,
  GetBlogPostResponse,
  GetBlogCategoriesResponse,
  BLOG_CONFIG,
} from './types';
import { IBlogApiService } from './api';
import { http } from '@/lib/http';

const BASE_URL = '/blog';

export class BlogService implements IBlogApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = BLOG_CONFIG.baseUrl;
    this.timeout = BLOG_CONFIG.timeout;
  }

  /**
   * Get all blog posts with optional filters
   */
  async getBlogPosts(params?: GetBlogPostsParams): Promise<GetBlogPostsResponse> {

    try {
      const queryParams = new URLSearchParams();

      if (params?.category) queryParams.append('category', params.category);
      if (params?.tag) queryParams.append('tag', params.tag);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.featured !== undefined)
        queryParams.append('featured', String(params.featured));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.offset) queryParams.append('offset', String(params.offset));

      const url = queryParams.toString()
        ? `${BASE_URL}/posts?${queryParams.toString()}`
        : `${BASE_URL}/posts`;

      const response = await http.get<any>(url);

      // Handle different API response structures
      if (response.data) {
        // Case 1: API returns { success: true, data: { posts: [...], total: X, hasMore: Y } }
        if (response.data.posts && Array.isArray(response.data.posts)) {
          return response.data as GetBlogPostsResponse;
        }
        
        // Case 2: API returns { success: true, data: [...] } - array directly
        if (Array.isArray(response.data)) {
          return {
            success: true,
            data: {
              posts: response.data,
              total: response.data.length,
              hasMore: false,
            },
          };
        }
        
        // Case 3: Response already in expected format
        return response.data as GetBlogPostsResponse;
      }

      // Fallback: return empty response
      return {
        success: false,
        data: {
          posts: [],
          total: 0,
          hasMore: false,
        },
        error: 'Invalid response structure',
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          posts: [],
          total: 0,
          hasMore: false,
        },
        error: error.response?.data?.error || error.message || 'Failed to fetch blog posts',
      };
    }
  }

  /**
   * Get a single blog post by slug
   */
  async getBlogPost(slug: string): Promise<GetBlogPostResponse> {
    try {
      const response = await http.get<GetBlogPostResponse>(`${BASE_URL}/posts/${slug}`);

      // Ensure response follows the expected structure
      if (response.data) {
        return response.data;
      }

      // If response doesn't have the expected structure, wrap it
      return {
        success: true,
        data: response.data as any,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message || 'Failed to fetch blog post',
      };
    }
  }

  /**
   * Get all blog categories
   */
  async getCategories(): Promise<GetBlogCategoriesResponse> {
    try {
      const response = await http.get<GetBlogCategoriesResponse>(`${BASE_URL}/categories`);

      // Ensure response follows the expected structure
      if (response.data) {
        return response.data;
      }

      // If response doesn't have the expected structure, wrap it
      return {
        success: true,
        data: response.data as any,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error:
          error.response?.data?.error || error.message || 'Failed to fetch blog categories',
      };
    }
  }

  /**
   * Get featured blog posts
   */
  async getFeaturedPosts(limit = 3): Promise<GetBlogPostsResponse> {
    return await this.getBlogPosts({ featured: true, limit });
  }
}
