/**
 * Transactions Service Index
 * Centralized export for transaction-related services
 */

// Export types
export * from './types';

// Export API interface
export * from './api';

// Export service implementation
export { TransactionService } from './transactionService';

// Create and export service instance
import { TransactionService } from './transactionService';

export const transactionService = new TransactionService();
