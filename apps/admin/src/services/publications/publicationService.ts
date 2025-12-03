/**
 * Admin Publications API Service
 */

import {
  PublicationApiResponse,
  PaginatedPublicationsResponse,
  GetPublicationsParams,
  GetPublicationStatsResponse,
  BlogPost,
  CreateBlogPostData,
  UpdateBlogPostData,
  BlogCategory,
  PUBLICATION_CONFIG,
} from './types';
import { IPublicationApiService } from './api';
import { mockBlogPosts, mockBlogCategories } from './mockData';

export class PublicationService implements IPublicationApiService {
  private baseUrl: string;
  private timeout: number;
  private useMockData: boolean;

  constructor() {
    this.baseUrl = PUBLICATION_CONFIG.baseUrl;
    this.timeout = PUBLICATION_CONFIG.timeout;
    this.useMockData = PUBLICATION_CONFIG.useMockData;
  }

  // Helper method for making HTTP requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<PublicationApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getStoredToken();
    if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      return {
        success: response.ok,
        message: data.message,
        data: (data.data as T) ?? (data as T),
        error: response.ok ? undefined : data.error,
      } as PublicationApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred',
        data: null as unknown as T,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Token helper
  private getStoredToken(): string | null {
    return (
      localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    );
  }

  // Helper to check authentication before making request
  private checkAuth<T>(): PublicationApiResponse<T> | null {
    const token = this.getStoredToken();
    if (!token) {
      return {
        success: false,
        message: 'Not authenticated',
        data: null as unknown as T,
        error: 'No authentication token found',
      };
    }
    return null;
  }

  // Mock data helper methods
  private getMockPublications(params?: GetPublicationsParams): PaginatedPublicationsResponse {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      search,
      status = 'all',
      featured,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = params || {};

    let filteredPosts = [...mockBlogPosts];

    // Filter by status
    if (status !== 'all') {
      filteredPosts = filteredPosts.filter((post) => post.status === status);
    }

    // Filter by category
    if (category && category !== 'all') {
      filteredPosts = filteredPosts.filter((post) => post.category === category);
    }

    // Filter by tag
    if (tag) {
      filteredPosts = filteredPosts.filter((post) =>
        post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
      );
    }

    // Filter by featured
    if (featured !== undefined) {
      filteredPosts = filteredPosts.filter((post) => post.featured === featured);
    }

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt.toLowerCase().includes(searchLower) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort
    filteredPosts.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'publishedAt':
          compareValue = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
          break;
        case 'createdAt':
          compareValue = new Date(a.createdAt || a.publishedAt).getTime() - new Date(b.createdAt || b.publishedAt).getTime();
          break;
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'readingTime':
          compareValue = a.readingTime - b.readingTime;
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    return {
      posts: paginatedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredPosts.length / limit),
        totalItems: filteredPosts.length,
        itemsPerPage: limit,
      },
    };
  }

  // Get all publications with filters and pagination
  async getPublications(params?: GetPublicationsParams): Promise<PublicationApiResponse<PaginatedPublicationsResponse>> {
    if (this.useMockData) {
      return {
        success: true,
        data: this.getMockPublications(params),
      };
    }

    const authError = this.checkAuth<PaginatedPublicationsResponse>();
    if (authError) return authError;

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.tag) queryParams.append('tag', params.tag);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.featured !== undefined) queryParams.append('featured', String(params.featured));
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const endpoint = `/admin/publications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<PaginatedPublicationsResponse>(endpoint, {
      method: 'GET',
    });
  }

  // Get publication by ID
  async getPublicationById(id: string): Promise<PublicationApiResponse<BlogPost>> {
    if (this.useMockData) {
      const post = mockBlogPosts.find((p) => p.id === id);
      if (!post) {
        return {
          success: false,
          message: 'Publication not found',
          error: 'Publication not found',
        };
      }
      return {
        success: true,
        data: post,
      };
    }

    const authError = this.checkAuth<BlogPost>();
    if (authError) return authError;

    const endpoint = `/admin/publications/${id}`;
    return this.makeRequest<BlogPost>(endpoint, {
      method: 'GET',
    });
  }

  // Create publication
  async createPublication(data: CreateBlogPostData): Promise<PublicationApiResponse<BlogPost>> {
    if (this.useMockData) {
      const newPost: BlogPost = {
        ...data,
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: data.status || 'draft',
      };
      mockBlogPosts.unshift(newPost);
      return {
        success: true,
        data: newPost,
        message: 'Publication created successfully',
      };
    }

    const authError = this.checkAuth<BlogPost>();
    if (authError) return authError;

    return this.makeRequest<BlogPost>('/admin/publications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update publication
  async updatePublication(data: UpdateBlogPostData): Promise<PublicationApiResponse<BlogPost>> {
    if (this.useMockData) {
      const index = mockBlogPosts.findIndex((p) => p.id === data.id);
      if (index === -1) {
        return {
          success: false,
          message: 'Publication not found',
          error: 'Publication not found',
        };
      }

      const updatedPost = {
        ...mockBlogPosts[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      mockBlogPosts[index] = updatedPost;
      return {
        success: true,
        data: updatedPost,
        message: 'Publication updated successfully',
      };
    }

    const authError = this.checkAuth<BlogPost>();
    if (authError) return authError;

    const endpoint = `/admin/publications/${data.id}`;
    return this.makeRequest<BlogPost>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete publication
  async deletePublication(id: string): Promise<PublicationApiResponse<void>> {
    if (this.useMockData) {
      const index = mockBlogPosts.findIndex((p) => p.id === id);
      if (index === -1) {
        return {
          success: false,
          message: 'Publication not found',
          error: 'Publication not found',
        };
      }
      mockBlogPosts.splice(index, 1);
      return {
        success: true,
        message: 'Publication deleted successfully',
      };
    }

    const authError = this.checkAuth<void>();
    if (authError) return authError;

    const endpoint = `/admin/publications/${id}`;
    return this.makeRequest<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Get publication stats
  async getPublicationStats(): Promise<PublicationApiResponse<GetPublicationStatsResponse>> {
    if (this.useMockData) {
      const totalPosts = mockBlogPosts.length;
      const publishedPosts = mockBlogPosts.filter((p) => p.status === 'published').length;
      const draftPosts = mockBlogPosts.filter((p) => p.status === 'draft').length;
      const archivedPosts = mockBlogPosts.filter((p) => p.status === 'archived').length;
      const featuredPosts = mockBlogPosts.filter((p) => p.featured).length;

      return {
        success: true,
        data: {
          stats: {
            totalPosts,
            publishedPosts,
            draftPosts,
            archivedPosts,
            featuredPosts,
          },
        },
      };
    }

    const authError = this.checkAuth<GetPublicationStatsResponse>();
    if (authError) return authError;

    const endpoint = '/admin/publications/stats';
    return this.makeRequest<GetPublicationStatsResponse>(endpoint, {
      method: 'GET',
    });
  }

  // Get categories
  async getCategories(): Promise<PublicationApiResponse<BlogCategory[]>> {
    if (this.useMockData) {
      return {
        success: true,
        data: mockBlogCategories,
      };
    }

    const authError = this.checkAuth<BlogCategory[]>();
    if (authError) return authError;

    const endpoint = '/admin/publications/categories';
    return this.makeRequest<BlogCategory[]>(endpoint, {
      method: 'GET',
    });
  }
}
