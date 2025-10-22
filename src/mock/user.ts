export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  totalEarnings: number;
  totalStaked: number;
  preferredCurrency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export const mockUserProfile: UserProfile = {
  id: 'user_123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: '/default-avatar.png',
  joinDate: '2024-01-01T00:00:00Z',
  totalEarnings: 1250.50,
  totalStaked: 5000,
  preferredCurrency: 'USD',
  notifications: {
    email: true,
    push: true,
    sms: false
  }
};

export const mockLeaderboardData = [
  {
    rank: 1,
    name: 'CryptoKing',
    totalStaked: 50000,
    earnings: 12500,
    avatar: '/avatar1.png'
  },
  {
    rank: 2,
    name: 'StakeMaster',
    totalStaked: 45000,
    earnings: 11250,
    avatar: '/avatar2.png'
  },
  {
    rank: 3,
    name: 'YieldHunter',
    totalStaked: 40000,
    earnings: 10000,
    avatar: '/avatar3.png'
  },
  {
    rank: 4,
    name: 'BlockchainPro',
    totalStaked: 35000,
    earnings: 8750,
    avatar: '/avatar4.png'
  },
  {
    rank: 5,
    name: 'DeFiExpert',
    totalStaked: 30000,
    earnings: 7500,
    avatar: '/avatar5.png'
  }
];
