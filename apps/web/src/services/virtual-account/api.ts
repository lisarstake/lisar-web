/**
 * Virtual Account API Service Interface
 * Defines the contract for virtual-account-related API operations
 */

import {
  BankAccountLookupRequest,
  BankAccountLookupResponse,
  CreateVirtualAccountRequest,
  NairaBalance,
  SupportedBank,
  TransactionDetails,
  TransactionHistoryQuery,
  TransactionHistoryResponse,
  VirtualAccountApiResponse,
  VirtualAccountDetails,
  WithdrawRequest,
  WithdrawResponse,
} from "./types";

export interface IVirtualAccountApiService {
  // Create user's Naira virtual account
  createVirtualAccount(
    request: CreateVirtualAccountRequest,
  ): Promise<VirtualAccountApiResponse<VirtualAccountDetails>>;

  // Get user's virtual account details
  getVirtualAccount(): Promise<VirtualAccountApiResponse<VirtualAccountDetails>>;

  // Get user's Naira balance
  getBalance(): Promise<VirtualAccountApiResponse<NairaBalance>>;

  // Get supported Nigerian banks
  getBanks(): Promise<VirtualAccountApiResponse<SupportedBank[]>>;

  // Lookup account details by account number and bank code
  lookupAccount(
    request: BankAccountLookupRequest,
  ): Promise<VirtualAccountApiResponse<BankAccountLookupResponse>>;

  // Withdraw Naira to bank account
  withdraw(
    request: WithdrawRequest,
  ): Promise<VirtualAccountApiResponse<WithdrawResponse>>;

  // Get paginated transaction history
  getTransactions(
    query?: TransactionHistoryQuery,
  ): Promise<VirtualAccountApiResponse<TransactionHistoryResponse>>;

  // Get transaction by reference
  getTransactionByReference(
    reference: string,
  ): Promise<VirtualAccountApiResponse<TransactionDetails>>;
}
