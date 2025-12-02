import { blogApi } from './api';
import { GetBlogPostsParams } from './types';

export const blogService = {
  /**
   * Get all blog posts with optional filters
   */
  getBlogPosts: async (params?: GetBlogPostsParams) => {
    return await blogApi.getBlogPosts(params);
  },

  /**
   * Get a single blog post by slug
   */
  getBlogPost: async (slug: string) => {
    return await blogApi.getBlogPost(slug);
  },

  /**
   * Get all blog categories
   */
  getCategories: async () => {
    return await blogApi.getCategories();
  },

  /**
   * Get featured blog posts
   */
  getFeaturedPosts: async (limit = 3) => {
    return await blogApi.getBlogPosts({ featured: true, limit });
  },
};

