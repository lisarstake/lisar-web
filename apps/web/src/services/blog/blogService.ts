import { blogApi } from './api';
import { GetBlogPostsParams, GetBlogPostsResponse, GetBlogPostResponse, GetBlogCategoriesResponse } from './types';

export const blogService = {
  /**
   * Get all blog posts with optional filters
   */
  getBlogPosts: async (params?: GetBlogPostsParams): Promise<GetBlogPostsResponse> => {
    return await blogApi.getBlogPosts(params);
  },

  /**
   * Get a single blog post by slug
   */
  getBlogPost: async (slug: string): Promise<GetBlogPostResponse> => {
    return await blogApi.getBlogPost(slug);
  },

  /**
   * Get all blog categories
   */
  getCategories: async (): Promise<GetBlogCategoriesResponse> => {
    return await blogApi.getCategories();
  },

  /**
   * Get featured blog posts
   */
  getFeaturedPosts: async (limit = 3): Promise<GetBlogPostsResponse> => {
    return await blogApi.getBlogPosts({ featured: true, limit });
  },
};
