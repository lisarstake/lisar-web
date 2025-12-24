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
  views?: number;
  created_at?: string;
  updated_at?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
}

