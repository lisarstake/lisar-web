/**
 * User API Service Interface
 * Defines the contract for user-related API operations
 */

import {
  UserApiResponse,
  User,
  UserStats,
  UserFilters,
  PaginatedUsersResponse,
  UserDetail,
  SuspendUserRequest,
  UpdateUserBalanceRequest,
} from './types';

export interface IUserApiService {
  // User operations
  getUserStats(): Promise<UserApiResponse<UserStats>>;
  getUsers(filters?: UserFilters): Promise<UserApiResponse<PaginatedUsersResponse>>;
  getUserById(userId: string): Promise<UserApiResponse<UserDetail>>;
  suspendUser(userId: string, request: SuspendUserRequest): Promise<UserApiResponse<void>>;
  unsuspendUser(userId: string): Promise<UserApiResponse<void>>;
  updateUserBalance(userId: string, request: UpdateUserBalanceRequest): Promise<UserApiResponse<void>>;
}

