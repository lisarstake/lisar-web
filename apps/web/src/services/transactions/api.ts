/**
 * Transactions API Service Interface
 * Defines the contract for transaction-related API operations
 */

import {
  TransactionApiResponse,
  TransactionData,
  TransactionType,
  CreateTransactionRequest,
  CreateTransactionResponse,
  UpdateTransactionStatusRequest,
  UpdateTransactionStatusResponse
} from './types';

export interface ITransactionApiService {
  // Get all transactions for a user
  getUserTransactions(userId: string): Promise<TransactionApiResponse<TransactionData[]>>;
  
  // Get a specific transaction by ID
  getTransactionById(transactionId: string): Promise<TransactionApiResponse<TransactionData>>;
  
  // Get user transactions by type
  getUserTransactionsByType(userId: string, type: TransactionType): Promise<TransactionApiResponse<TransactionData[]>>;
  
  // Create a new transaction
  createTransaction(request: CreateTransactionRequest): Promise<CreateTransactionResponse>;
  
  // Update transaction status
  updateTransactionStatus(transactionId: string, request: UpdateTransactionStatusRequest): Promise<UpdateTransactionStatusResponse>;
}
