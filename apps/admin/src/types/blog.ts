export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  coverImage: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number; // in minutes
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
  status?: 'all' | 'draft' | 'published' | 'archived';
  featured?: boolean;
  sortBy?: 'publishedAt' | 'createdAt' | 'title' | 'readingTime';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  totalViews?: number;
  featuredPosts: number;
}

export interface CreateBlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  coverImage: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}

