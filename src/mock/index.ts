/**
 * Mock Data Index
 * Centralized export for all mock data
 */

export * from './orchestrators';
export * from './transactions';
export * from './learn';
export * from './portfolio';
export * from './notifications';
export * from './user';

// Wallet exports (avoiding duplicate mockWalletData)
export { mockDepositData } from './wallet';
