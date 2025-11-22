/**
 * Wallet API Service Interface
 * Defines the contract for wallet-related API operations
 */

import {
  WalletApiResponse,
  WalletData,
  BalanceResponse,
  ExportResponse,
  SendLptRequest,
  SendLptResponse,
  ApproveLptRequest,
  ApproveLptResponse
} from './types';

export interface IWalletApiService {
  // Get wallet by ID
  getWallet(walletId: string): Promise<WalletApiResponse<WalletData>>;
  
  // Get wallet balance
  getBalance(walletAddress: string, token: 'ETH' | 'LPT'): Promise<BalanceResponse>;
  
  // Export wallet private key
  exportWallet(walletId: string): Promise<ExportResponse>;

  // Send LPT
  sendLpt(request: SendLptRequest): Promise<SendLptResponse>;

  // Approve LPT
  approveLpt(request: ApproveLptRequest): Promise<ApproveLptResponse>;
}
