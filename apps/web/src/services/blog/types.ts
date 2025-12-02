import { BlogPost, BlogCategory } from '@/types/blog';

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
}

export interface GetBlogPostResponse {
  success: boolean;
  data: BlogPost | null;
  message?: string;
}

export interface GetBlogCategoriesResponse {
  success: boolean;
  data: BlogCategory[];
  message?: string;
}

