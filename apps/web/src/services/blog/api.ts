import { http } from '@/lib/http';
import { 
  GetBlogPostsParams, 
  GetBlogPostsResponse,
  GetBlogPostResponse,
  GetBlogCategoriesResponse
} from './types';

const BASE_URL = '/blog';

export const blogApi = {
  /**
   * Get all blog posts with optional filters
   */
  getBlogPosts: async (params?: GetBlogPostsParams): Promise<GetBlogPostsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.category) queryParams.append('category', params.category);
      if (params?.tag) queryParams.append('tag', params.tag);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.featured !== undefined) queryParams.append('featured', String(params.featured));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.offset) queryParams.append('offset', String(params.offset));

      const url = queryParams.toString() 
        ? `${BASE_URL}/posts?${queryParams.toString()}`
        : `${BASE_URL}/posts`;

      const response = await http.get<GetBlogPostsResponse>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  },

  /**
   * Get a single blog post by slug
   */
  getBlogPost: async (slug: string): Promise<GetBlogPostResponse> => {
    try {
      const response = await http.get<GetBlogPostResponse>(`${BASE_URL}/posts/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  },

  /**
   * Get all blog categories
   */
  getCategories: async (): Promise<GetBlogCategoriesResponse> => {
    try {
      const response = await http.get<GetBlogCategoriesResponse>(`${BASE_URL}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      throw error;
    }
  },
};

