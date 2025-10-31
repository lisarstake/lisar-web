/**
 * Transactions API Service Interface
 * Defines the contract for transactions-related API operations
 */

import {
  TransactionApiResponse,
  DashboardSummary,
  Transaction,
  TransactionStats,
  TransactionFilters,
  PaginatedTransactionsResponse,
} from './types';

export interface ITransactionApiService {
  getDashboardSummary(): Promise<TransactionApiResponse<DashboardSummary>>;
  getTransactions(limit?: number): Promise<TransactionApiResponse<Transaction[]>>;
  getAllTransactions(filters?: TransactionFilters): Promise<TransactionApiResponse<PaginatedTransactionsResponse>>;
  getTransactionStats(): Promise<TransactionApiResponse<TransactionStats>>;
  getFailedTransactions(limit?: number): Promise<TransactionApiResponse<Transaction[]>>;
  getPendingTransactions(olderThanMinutes?: number): Promise<TransactionApiResponse<Transaction[]>>;
}

