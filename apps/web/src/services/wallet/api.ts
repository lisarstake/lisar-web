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
  ChainType,
  SolanaBalanceResponse,
  SolanaSendRequest,
  SolanaSendResponse,
  ApproveTokenRequest,
  ApproveTokenResponse,
  SendTokenRequest,
  SendTokenResponse,
  GetSpendersResponse
} from './types';

export interface IWalletApiService {
  // Get wallet by ID
  getWallet(walletId: string): Promise<WalletApiResponse<WalletData>>;
  
  // Get wallet balance
  getBalance(
    walletAddress: string,
    token: 'ETH' | 'LPT' | 'USDC' | 'USDT',
    chainId?: 1 | 42161
  ): Promise<BalanceResponse>;

  // Get Solana wallet balance (always fetches all token balances)
  getSolanaBalance(walletAddress: string): Promise<SolanaBalanceResponse>;
  
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

  // Send Solana tokens
  sendSolana(request: SolanaSendRequest): Promise<SolanaSendResponse>;

  // Approve token for spending (with chainId)
  approveToken(chainId: 1 | 42161, token: 'LPT' | 'USDC' | 'USDT', request: ApproveTokenRequest, spender: string): Promise<ApproveTokenResponse>;

  // Send token (with chainId)
  sendToken(chainId: 1 | 42161, token: 'ETH' | 'LPT' | 'USDC' | 'USDT', request: SendTokenRequest): Promise<SendTokenResponse>;

  // Get spenders for a token on a chain
  getSpenders(chainId: 1 | 42161, token: 'ETH' | 'LPT' | 'USDC' | 'USDT' | 'all'): Promise<GetSpendersResponse>;
}
