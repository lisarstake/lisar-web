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
  ApproveLptResponse,
  GetWalletsResponse,
  GetPrimaryWalletResponse,
  CreateSolanaWalletRequest,
  CreateSolanaWalletResponse,
  ChainType
} from './types';

export interface IWalletApiService {
  // Get wallet by ID
  getWallet(walletId: string): Promise<WalletApiResponse<WalletData>>;
  
  // Get wallet balance
  getBalance(walletAddress: string, token: 'ETH' | 'LPT' | 'USDC'): Promise<BalanceResponse>;
  
  // Export wallet private key
  exportWallet(walletId: string): Promise<ExportResponse>;

  // Send LPT
  sendLpt(request: SendLptRequest): Promise<SendLptResponse>;

  // Approve LPT
  approveLpt(request: ApproveLptRequest): Promise<ApproveLptResponse>;

  // Get all wallets for authenticated user
  getWallets(chainType?: ChainType): Promise<GetWalletsResponse>;

  // Get primary wallet for a specific chain
  getPrimaryWallet(chainType: ChainType): Promise<GetPrimaryWalletResponse>;

  // Create a new Solana wallet
  createSolanaWallet(request: CreateSolanaWalletRequest): Promise<CreateSolanaWalletResponse>;
}
