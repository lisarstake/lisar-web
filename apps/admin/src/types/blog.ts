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
  cover_image: string;
  category: string;
  tags: string[];
  published_at: string;
  reading_time: number; // in minutes
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  views?: number;
  created_at?: string;
  updated_at?: string;
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
  sortBy?: 'published_at' | 'created_at' | 'title' | 'reading_time';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  archived_posts: number;
  total_views?: number;
  featured_posts: number;
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
  cover_image: string;
  category: string;
  tags: string[];
  published_at: string;
  reading_time: number;
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
  id: string;
}

