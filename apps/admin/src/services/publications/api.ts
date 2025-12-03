/**
 * Publication API Service Interface
 * Defines the contract for publication-related API operations
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
} from './types';

export interface IPublicationApiService {
  // Publication operations
  getPublications(params?: GetPublicationsParams): Promise<PublicationApiResponse<PaginatedPublicationsResponse>>;
  getPublicationById(id: string): Promise<PublicationApiResponse<BlogPost>>;
  createPublication(data: CreateBlogPostData): Promise<PublicationApiResponse<BlogPost>>;
  updatePublication(data: UpdateBlogPostData): Promise<PublicationApiResponse<BlogPost>>;
  deletePublication(id: string): Promise<PublicationApiResponse<void>>;
  getPublicationStats(): Promise<PublicationApiResponse<GetPublicationStatsResponse>>;
  getCategories(): Promise<PublicationApiResponse<BlogCategory[]>>;
}
