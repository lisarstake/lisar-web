/**
 * Admin Transactions API Types
 */

// Base API Response
export interface TransactionApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Dashboard Summary 
export interface DashboardSummary {
  totalDelegators: number;
  totalNgNConverted: number;
  totalLptDelegated: number;
  totalValidators: number;
  lastUpdated: string;
}

// Dashboard Transaction Types (for public dashboard endpoint)
export interface DashboardTransaction {
  address: string;
  event: string;
  description: string;
  date: string;
  transaction_hash: string;
}

// Transaction User Info
export interface TransactionUser {
  user_id: string;
  privy_user_id: string;
  wallet_address: string;
}

// Transaction
export interface Transaction {
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
  users: TransactionUser;
}

// Extended Transaction User Info (with lpt_balance)
export interface TransactionDetailUser extends TransactionUser {
  lpt_balance?: number;
}

// Transaction Detail
export interface TransactionDetail extends Transaction {
  users: TransactionDetailUser;
  relatedTransactions?: Transaction[];
}

// Transaction Filters
export interface TransactionFilters {
  page?: number;
  limit?: number;
  userId?: string;
  status?: "pending" | "confirmed" | "failed";
  type?: "deposit" | "withdrawal" | "delegation" | "undelegation";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Paginated Response
export interface PaginatedTransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Transaction Statistics
export interface DailyVolume {
  date: string;
  volume: number;
  count: number;
}

export interface TransactionStats {
  total: number;
  pending: number;
  confirmed: number;
  failed: number;
  totalVolume: number;
  averageAmount: number;
  byType: {
    deposit: number;
    withdrawal: number;
    delegation: number;
    undelegation: number;
  };
  bySource: {
    privy_webhook: number;
    manual: number;
    api: number;
    delegation_api: number;
  };
  dailyVolume: DailyVolume[];
}

// API Configuration
export interface TransactionConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export const TRANSACTION_CONFIG: TransactionConfig = {
  baseUrl: 'https://lisar-api-1.onrender.com/api/v1',
  timeout: 30000,
  retryAttempts: 3,
};

