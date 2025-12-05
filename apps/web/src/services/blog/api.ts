/**
 * Blog API Service Interface
 * Defines the contract for blog-related API operations
 */

import {
  GetBlogPostsParams,
  GetBlogPostsResponse,
  GetBlogPostResponse,
  GetBlogCategoriesResponse,
} from './types';

export interface IBlogApiService {
  getBlogPosts(params?: GetBlogPostsParams): Promise<GetBlogPostsResponse>;
  getBlogPost(slug: string): Promise<GetBlogPostResponse>;
  getCategories(): Promise<GetBlogCategoriesResponse>;
  getFeaturedPosts(limit?: number): Promise<GetBlogPostsResponse>;
}
