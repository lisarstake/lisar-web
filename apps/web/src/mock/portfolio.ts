export interface StakeEntry {
  id: string;
  name: string;
  yourStake: number;
  apy: number;
  fee: number;
}

export const mockStakeEntries: StakeEntry[] = [
  {
    id: "2",
    name: "streamplace.eth",
    yourStake: 2508,
    apy: 65.6,
    fee: 0
  },
  {
    id: "4",
    name: "day-dreamer.eth",
    yourStake: 1200,
    apy: 58.2,
    fee: 0
  },
  {
    id: "3",
    name: "everest-node.eth",
    yourStake: 800,
    apy: 72.1,
    fee: 0
  },
  {
    id: "5",
    name: "interptr.eth",
    yourStake: 600,
    apy: 61.8,
    fee: 0
  },
  {
    id: "6",
    name: "tor-node.eth",
    yourStake: 1000,
    apy: 69.3,
    fee: 0
  },
  {
    id: "7",
    name: "pepenode.eth",
    yourStake: 750,
    apy: 63.7,
    fee: 0
  }
];

export const mockPortfolioStats = {
  totalStake: mockStakeEntries.reduce((sum, entry) => sum + entry.yourStake, 0),
  weeklyEarnings: 0, // Will be calculated based on totalStake
  nextPayoutHours: 22,
  payoutProgress: 85
};
