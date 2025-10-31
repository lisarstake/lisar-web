/**
 * Wallet Service Index
 * Centralized export for wallet-related services
 */

// Export types
export * from './types';

// Export API interface
export * from './api';

// Export service implementation
export { WalletService } from './walletService';

// Create and export service instance
import { WalletService } from './walletService';

export const walletService = new WalletService();
