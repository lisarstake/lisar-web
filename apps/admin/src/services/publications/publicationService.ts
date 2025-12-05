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
  IPublicationApiService,
} from './types';

export class PublicationService implements IPublicationApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = PUBLICATION_CONFIG.baseUrl;
    this.timeout = PUBLICATION_CONFIG.timeout;
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

  // Get all publications with filters and pagination
  async getPublications(params?: GetPublicationsParams): Promise<PublicationApiResponse<PaginatedPublicationsResponse>> {

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
    if (params?.sortBy) queryParams.append('sort_by', params.sortBy);
    if (params?.sortOrder) queryParams.append('sort_order', params.sortOrder);

    const endpoint = `/admin/publications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.makeRequest<any>(endpoint, {
      method: 'GET',
    });

    // Transform the response if API returns an array directly instead of the expected structure
    if (response.success && response.data && Array.isArray(response.data)) {
      const posts = response.data;
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      
      return {
        success: true,
        data: {
          posts: posts,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(posts.length / limit),
            total_items: posts.length,
            items_per_page: limit,
          },
        },
      };
    }

    return response;
  }

  // Get publication by ID
  async getPublicationById(id: string): Promise<PublicationApiResponse<BlogPost>> {
    const authError = this.checkAuth<BlogPost>();
    if (authError) return authError;

    const endpoint = `/admin/publications/${id}`;
    return this.makeRequest<BlogPost>(endpoint, {
      method: 'GET',
    });
  }

  // Create publication
  async createPublication(data: CreateBlogPostData): Promise<PublicationApiResponse<BlogPost>> {
    const authError = this.checkAuth<BlogPost>();
    if (authError) return authError;

    return this.makeRequest<BlogPost>('/admin/publications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update publication
  async updatePublication(data: UpdateBlogPostData): Promise<PublicationApiResponse<BlogPost>> {
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
    const authError = this.checkAuth<void>();
    if (authError) return authError;

    const endpoint = `/admin/publications/${id}`;
    return this.makeRequest<void>(endpoint, {
      method: 'DELETE',
    });
  }

  // Get publication stats
  async getPublicationStats(): Promise<PublicationApiResponse<GetPublicationStatsResponse>> {
    const authError = this.checkAuth<GetPublicationStatsResponse>();
    if (authError) return authError;

    const endpoint = '/admin/publications/stats';
    const response = await this.makeRequest<any>(endpoint, {
      method: 'GET',
    });

    // Transform camelCase to snake_case for stats
    if (response.success && response.data) {
      const camelStats = response.data;
      return {
        success: true,
        data: {
          total_posts: camelStats.totalPosts,
          published_posts: camelStats.publishedPosts,
          draft_posts: camelStats.draftPosts,
          archived_posts: camelStats.archivedPosts,
          featured_posts: camelStats.featuredPosts,
          total_views: camelStats.totalViews,
        },
      };
    }

    return response;
  }

  // Get categories
  async getCategories(): Promise<PublicationApiResponse<BlogCategory[]>> {
    const authError = this.checkAuth<BlogCategory[]>();
    if (authError) return authError;

    const endpoint = '/admin/publications/categories';
    return this.makeRequest<BlogCategory[]>(endpoint, {
      method: 'GET',
    });
  }

  // Create category
  async createCategory(data: { name: string; description?: string }): Promise<PublicationApiResponse<BlogCategory>> {
    const authError = this.checkAuth<BlogCategory>();
    if (authError) return authError;

    const endpoint = '/admin/publications/categories';
    return this.makeRequest<BlogCategory>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update category
  async updateCategory(id: string, data: { name: string; description?: string }): Promise<PublicationApiResponse<BlogCategory>> {
    const authError = this.checkAuth<BlogCategory>();
    if (authError) return authError;

    const endpoint = `/admin/publications/categories/${id}`;
    return this.makeRequest<BlogCategory>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
