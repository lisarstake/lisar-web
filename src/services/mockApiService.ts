/**
 * Mock API Service
 * Implements the API service interface using mock data
 */

import { IApiService } from './api';
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

import {
  mockOrchestrators,
  mockWalletData,
  mockWalletAddress
} from '../mock/orchestrators';
import { mockTransactions } from '../mock/transactions';
import { mockUserProfile, mockLeaderboardData } from '../mock/user';
import { mockNotifications } from '../mock/notifications';
import { mockLearnContent } from '../mock/learn';
import { mockStakeEntries, mockPortfolioStats } from '../mock/portfolio';

export class MockApiService implements IApiService {
  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Orchestrators
  async getOrchestrators(): Promise<ApiResponse<OrchestratorApiResponse[]>> {
    await this.delay();
    return {
      data: mockOrchestrators.map(orch => ({
        ...orch,
        performance: {
          uptime: 99.9,
          lastUpdate: new Date().toISOString()
        },
        status: 'active' as const
      })),
      success: true
    };
  }

  async getOrchestratorById(id: string): Promise<ApiResponse<OrchestratorApiResponse>> {
    await this.delay();
    const orchestrator = mockOrchestrators.find(orch => orch.id === id);
    if (!orchestrator) {
      return {
        data: null as any,
        success: false,
        error: 'Orchestrator not found'
      };
    }
    return {
      data: {
        ...orchestrator,
        performance: {
          uptime: 99.9,
          lastUpdate: new Date().toISOString()
        },
        status: 'active' as const
      },
      success: true
    };
  }

  async getOrchestratorBySlug(slug: string): Promise<ApiResponse<OrchestratorApiResponse>> {
    await this.delay();
    const orchestrator = mockOrchestrators.find(orch => orch.slug === slug);
    if (!orchestrator) {
      return {
        data: null as any,
        success: false,
        error: 'Orchestrator not found'
      };
    }
    return {
      data: {
        ...orchestrator,
        performance: {
          uptime: 99.9,
          lastUpdate: new Date().toISOString()
        },
        status: 'active' as const
      },
      success: true
    };
  }

  // Transactions
  async getTransactions(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<TransactionApiResponse>> {
    await this.delay();
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = mockTransactions.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      success: true,
      pagination: {
        page,
        limit,
        total: mockTransactions.length,
        totalPages: Math.ceil(mockTransactions.length / limit)
      }
    };
  }

  async getTransactionById(id: string): Promise<ApiResponse<TransactionApiResponse>> {
    await this.delay();
    const transaction = mockTransactions.find(tx => tx.id === id);
    if (!transaction) {
      return {
        data: null as any,
        success: false,
        error: 'Transaction not found'
      };
    }
    return {
      data: transaction,
      success: true
    };
  }

  // Wallet
  async getWalletData(): Promise<ApiResponse<WalletApiResponse>> {
    await this.delay();
    return {
      data: {
        ...mockWalletData,
        address: mockWalletAddress.full,
        lastUpdated: new Date().toISOString()
      },
      success: true
    };
  }

  async getWalletAddress(): Promise<ApiResponse<{ address: string; shortAddress: string }>> {
    await this.delay();
    return {
      data: {
        address: mockWalletAddress.full,
        shortAddress: mockWalletAddress.short
      },
      success: true
    };
  }

  // Staking
  async stake(request: StakingRequest): Promise<ApiResponse<StakingResponse>> {
    await this.delay(1000); // Simulate longer processing time
    return {
      data: {
        transactionId: `stake_${Date.now()}`,
        status: 'processing',
        estimatedCompletion: new Date(Date.now() + 300000).toISOString() // 5 minutes
      },
      success: true
    };
  }

  async unstake(validatorId: string, amount: number): Promise<ApiResponse<StakingResponse>> {
    await this.delay(1000);
    return {
      data: {
        transactionId: `unstake_${Date.now()}`,
        status: 'processing',
        estimatedCompletion: new Date(Date.now() + 300000).toISOString()
      },
      success: true
    };
  }

  async withdraw(validatorId: string, amount: number, network: string): Promise<ApiResponse<StakingResponse>> {
    await this.delay(1000);
    return {
      data: {
        transactionId: `withdraw_${Date.now()}`,
        status: 'processing',
        estimatedCompletion: new Date(Date.now() + 600000).toISOString() // 10 minutes
      },
      success: true
    };
  }

  // User
  async getUserProfile(): Promise<ApiResponse<UserApiResponse>> {
    await this.delay();
    return {
      data: mockUserProfile,
      success: true
    };
  }

  async updateUserProfile(profile: Partial<UserApiResponse>): Promise<ApiResponse<UserApiResponse>> {
    await this.delay();
    return {
      data: { ...mockUserProfile, ...profile },
      success: true
    };
  }

  // Notifications
  async getNotifications(): Promise<ApiResponse<NotificationApiResponse[]>> {
    await this.delay();
    return {
      data: mockNotifications,
      success: true
    };
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<void>> {
    await this.delay();
    return {
      data: undefined,
      success: true
    };
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    await this.delay();
    return {
      data: undefined,
      success: true
    };
  }

  // Learn Content
  async getLearnContent(): Promise<ApiResponse<LearnContentApiResponse[]>> {
    await this.delay();
    return {
      data: mockLearnContent.map(content => ({
        ...content,
        duration: 300, // 5 minutes
        publishedAt: '2024-01-01T00:00:00Z'
      })),
      success: true
    };
  }

  async getLearnContentById(id: string): Promise<ApiResponse<LearnContentApiResponse>> {
    await this.delay();
    const content = mockLearnContent.find(c => c.id === id);
    if (!content) {
      return {
        data: null as any,
        success: false,
        error: 'Content not found'
      };
    }
    return {
      data: {
        ...content,
        duration: 300,
        publishedAt: '2024-01-01T00:00:00Z'
      },
      success: true
    };
  }

  async getLearnContentByCategory(category: 'mandatory' | 'academy'): Promise<ApiResponse<LearnContentApiResponse[]>> {
    await this.delay();
    const filteredContent = mockLearnContent.filter(c => c.category === category);
    return {
      data: filteredContent.map(content => ({
        ...content,
        duration: 300,
        publishedAt: '2024-01-01T00:00:00Z'
      })),
      success: true
    };
  }

  // Portfolio
  async getPortfolioStats(): Promise<ApiResponse<{
    totalStake: number;
    weeklyEarnings: number;
    nextPayoutHours: number;
    payoutProgress: number;
  }>> {
    await this.delay();
    return {
      data: {
        ...mockPortfolioStats,
        weeklyEarnings: mockPortfolioStats.totalStake * 0.01
      },
      success: true
    };
  }

  async getStakeEntries(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    yourStake: number;
    apy: number;
    fee: number;
  }>>> {
    await this.delay();
    return {
      data: mockStakeEntries,
      success: true
    };
  }
}
