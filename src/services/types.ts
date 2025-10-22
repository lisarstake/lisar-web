/**
 * API Service Types
 * Defines interfaces for API responses and requests
 */

// Base API Response
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Orchestrator API Types
export interface OrchestratorApiResponse {
  id: string;
  name: string;
  slug: string;
  icon: string;
  totalStaked: number;
  apy: number;
  fee: number;
  performance: {
    uptime: number;
    lastUpdate: string;
  };
  status: 'active' | 'inactive' | 'maintenance';
}

// Transaction API Types
export interface TransactionApiResponse {
  id: string;
  type: 'fund-wallet' | 'withdraw-stake' | 'stake' | 'unstake' | 'withdrawal';
  title: string;
  amount: number;
  currency: string;
  date: Date;
  status: 'pending' | 'succeeded' | 'failed';
  network?: string;
  fee?: number;
  from?: string;
  to?: string;
  hash?: string;
  blockNumber?: number;
  description?: string;
}

// Wallet API Types
export interface WalletApiResponse {
  balance: number;
  currency: string;
  fiatValue: string;
  fiatCurrency: string;
  address: string;
  lastUpdated: string;
}

// Staking API Types
export interface StakingRequest {
  validatorId: string;
  amount: number;
  paymentMethod: 'wallet' | 'fiat' | 'onchain';
}

export interface StakingResponse {
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedCompletion: string;
}

// User API Types
export interface UserApiResponse {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  totalEarnings: number;
  totalStaked: number;
  preferredCurrency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// Notification API Types
export interface NotificationApiResponse {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

// Learn Content API Types
export interface LearnContentApiResponse {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  videoUrl: string;
  brief: string;
  fullContent: string;
  category: 'mandatory' | 'academy';
  duration: number;
  publishedAt: string;
}
