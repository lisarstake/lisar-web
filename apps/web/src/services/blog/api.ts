import { http } from '@/lib/http';
import { 
  GetBlogPostsParams, 
  GetBlogPostsResponse,
  GetBlogPostResponse,
  GetBlogCategoriesResponse,
  BLOG_CONFIG
} from './types';
import { mockBlogPosts, mockBlogCategories } from '@/mock/blog';

const BASE_URL = '/blog';

// Mock data helper functions
const getMockBlogPosts = (params?: GetBlogPostsParams) => {
  let filteredPosts = [...mockBlogPosts];

  // Filter by category
  if (params?.category) {
    filteredPosts = filteredPosts.filter(
      (post) => post.category.toLowerCase() === params.category!.toLowerCase()
    );
  }

  // Filter by tag
  if (params?.tag) {
    filteredPosts = filteredPosts.filter((post) =>
      post.tags.some((t) => t.toLowerCase() === params.tag!.toLowerCase())
    );
  }

  // Filter by featured
  if (params?.featured !== undefined) {
    filteredPosts = filteredPosts.filter((post) => post.featured === params.featured);
  }

  // Search
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }

  // Sort by published date (newest first)
  filteredPosts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Apply limit and offset
  const limit = params?.limit || filteredPosts.length;
  const offset = params?.offset || 0;
  const paginatedPosts = filteredPosts.slice(offset, offset + limit);

  return {
    success: true,
    data: {
      posts: paginatedPosts,
      total: filteredPosts.length,
      hasMore: offset + limit < filteredPosts.length,
    },
  } as GetBlogPostsResponse;
};

const getMockBlogPost = (slug: string): GetBlogPostResponse => {
  const post = mockBlogPosts.find((p) => p.slug === slug);
  return {
    success: !!post,
    data: post || null,
    message: post ? undefined : 'Blog post not found',
    error: post ? undefined : 'Blog post not found',
  };
};

const getMockCategories = (): GetBlogCategoriesResponse => {
  return {
    success: true,
    data: mockBlogCategories,
  };
};

export const blogApi = {
  /**
   * Get all blog posts with optional filters
   */
  getBlogPosts: async (params?: GetBlogPostsParams): Promise<GetBlogPostsResponse> => {
    // Use mock data if configured
    if (BLOG_CONFIG.useMockData) {
      return getMockBlogPosts(params);
    }

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
      console.error('Error fetching blog posts:', error);
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
  },

  /**
   * Get a single blog post by slug
   */
  getBlogPost: async (slug: string): Promise<GetBlogPostResponse> => {
    // Use mock data if configured
    if (BLOG_CONFIG.useMockData) {
      return getMockBlogPost(slug);
    }

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
      console.error('Error fetching blog post:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.error || error.message || 'Failed to fetch blog post',
      };
    }
  },

  /**
   * Get all blog categories
   */
  getCategories: async (): Promise<GetBlogCategoriesResponse> => {
    // Use mock data if configured
    if (BLOG_CONFIG.useMockData) {
      return getMockCategories();
    }

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
      console.error('Error fetching blog categories:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.error || error.message || 'Failed to fetch blog categories',
      };
    }
  },
};
