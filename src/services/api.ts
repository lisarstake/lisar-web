/**
 * API Service Interface
 * Defines the contract for API services
 */

import {
  ApiResponse,
  PaginatedResponse,
  OrchestratorApiResponse,
  TransactionApiResponse,
  WalletApiResponse,
  StakingRequest,
  StakingResponse,
  UserApiResponse,
  NotificationApiResponse,
  LearnContentApiResponse
} from './types';

export interface IApiService {
  // Orchestrators
  getOrchestrators(): Promise<ApiResponse<OrchestratorApiResponse[]>>;
  getOrchestratorById(id: string): Promise<ApiResponse<OrchestratorApiResponse>>;
  getOrchestratorBySlug(slug: string): Promise<ApiResponse<OrchestratorApiResponse>>;

  // Transactions
  getTransactions(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<TransactionApiResponse>>;
  getTransactionById(id: string): Promise<ApiResponse<TransactionApiResponse>>;

  // Wallet
  getWalletData(): Promise<ApiResponse<WalletApiResponse>>;
  getWalletAddress(): Promise<ApiResponse<{ address: string; shortAddress: string }>>;

  // Staking
  stake(request: StakingRequest): Promise<ApiResponse<StakingResponse>>;
  unstake(validatorId: string, amount: number): Promise<ApiResponse<StakingResponse>>;
  withdraw(validatorId: string, amount: number, network: string): Promise<ApiResponse<StakingResponse>>;

  // User
  getUserProfile(): Promise<ApiResponse<UserApiResponse>>;
  updateUserProfile(profile: Partial<UserApiResponse>): Promise<ApiResponse<UserApiResponse>>;

  // Notifications
  getNotifications(): Promise<ApiResponse<NotificationApiResponse[]>>;
  markNotificationAsRead(id: string): Promise<ApiResponse<void>>;
  markAllNotificationsAsRead(): Promise<ApiResponse<void>>;

  // Learn Content
  getLearnContent(): Promise<ApiResponse<LearnContentApiResponse[]>>;
  getLearnContentById(id: string): Promise<ApiResponse<LearnContentApiResponse>>;
  getLearnContentByCategory(category: 'mandatory' | 'academy'): Promise<ApiResponse<LearnContentApiResponse[]>>;

  // Portfolio
  getPortfolioStats(): Promise<ApiResponse<{
    totalStake: number;
    weeklyEarnings: number;
    nextPayoutHours: number;
    payoutProgress: number;
  }>>;
  getStakeEntries(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    yourStake: number;
    apy: number;
    fee: number;
  }>>>;
}
