/**
 * Admin Users API Types
 */

// Base API Response
export interface UserApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// User Model
export interface User {
  full_name: string;
  email: string;
  user_id: string;
  privy_user_id: string;
  wallet_id: string;
  wallet_address: string;
  chain_type: string;
  img: string | null;
  DOB: string | null;
  country: string | null;
  state: string | null;
  fiat_type: string | null;
  fiat_balance: number;
  lpt_balance: number;
  created_date: string | null;
  is_suspended: boolean;
  suspension_reason: string | null;
  suspended_at: string | null;
  updated_at: string;
}

// User Statistics
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalLptBalance: number;
  newUsersToday: number;
}

// Transaction Model (for nested transactions in user detail)
export interface UserTransaction {
  created_at: string;
  user_id: string;
  transaction_hash: string;
  transaction_type: string;
  amount: number;
  token_address: string;
  token_symbol: string;
  wallet_address: string;
  wallet_id: string;
  status: string;
  id: string | null;
  svix_id: string | null;
  source: string | null;
  tid: string;
}

// Transaction Stats (for user detail)
export interface UserTransactionStats {
  totalTransactions: number;
  totalVolume: number;
  pendingTransactions: number;
}

// User Detail (includes transactions)
export interface UserDetail extends User {
  transactions: UserTransaction[];
  transactionStats: UserTransactionStats;
}

// Paginated Users Response
export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User Filters
export interface UserFilters {
  page?: number;
  limit?: number;
  status?: "all" | "active" | "suspended";
  sortBy?: "lpt_balance" | "created_at" | "user_id";
  sortOrder?: "asc" | "desc";
}

// Suspend User Request
export interface SuspendUserRequest {
  reason: string;
}

// Update User Balance Request
export interface UpdateUserBalanceRequest {
  balance: number;
  reason: string;
}

// API Configuration
export interface UserConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const USER_CONFIG: UserConfig = {
  baseUrl: 'https://lisar-api-1.onrender.com/api/v1',
  timeout: 30000,
  retryAttempts: 3,
};

