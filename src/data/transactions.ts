import { Transaction, TransactionGroup } from "@/types/transaction";

export const transactions: Transaction[] = [
  {
    id: "1",
    type: "fund-wallet",
    title: "Fund wallet",
    amount: 1000,
    currency: "LPT",
    date: new Date(),
    status: "succeeded",
    to: "Your wallet",
    from: "External wallet",
    network: "Arbitrum One",
    fee: 0.5,
    description: "Deposited funds to your wallet"
  },
  {
    id: "2",
    type: "stake",
    title: "Stake",
    amount: 500,
    currency: "LPT",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: "succeeded",
    to: "streamplace.eth",
    from: "Your wallet",
    network: "Arbitrum One",
    fee: 0.1,
    description: "Staked with validator"
  },
  {
    id: "3",
    type: "unstake",
    title: "Unstake",
    amount: 200,
    currency: "LPT",
    date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    status: "succeeded",
    to: "Your wallet",
    from: "neuralstream.eth",
    network: "Arbitrum One",
    fee: 0.1,
    description: "Unstaked from validator"
  },
  {
    id: "4",
    type: "withdraw-stake",
    title: "Withdraw stake",
    amount: 150,
    currency: "LPT",
    date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    status: "succeeded",
    to: "Your wallet",
    from: "coef120.eth",
    network: "Arbitrum One",
    fee: 0.1,
    description: "Withdrew staked funds"
  },
  {
    id: "5",
    type: "withdrawal",
    title: "External withdrawal",
    amount: 50,
    currency: "USDC",
    date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    status: "succeeded",
    to: "0x6f71...a98o",
    from: "Your wallet",
    network: "Arbitrum One",
    fee: 0.5,
    description: "Withdrew to external wallet"
  },
  {
    id: "6",
    type: "fund-wallet",
    title: "Fund wallet",
    amount: 2000,
    currency: "LPT",
    date: new Date(2025, 0, 15), // Jan 15, 2025
    status: "succeeded",
    to: "Your wallet",
    from: "External wallet",
    network: "Arbitrum One",
    fee: 1.0,
    description: "Deposited funds to your wallet"
  },
  {
    id: "7",
    type: "stake",
    title: "Stake",
    amount: 800,
    currency: "LPT",
    date: new Date(2025, 0, 14), // Jan 14, 2025
    status: "succeeded",
    to: "ipt.moudi.eth",
    from: "Your wallet",
    network: "Arbitrum One",
    fee: 0.2,
    description: "Staked with validator"
  },
  {
    id: "8",
    type: "withdrawal",
    title: "External withdrawal",
    amount: 0.5,
    currency: "SOL",
    date: new Date(2025, 0, 13), // Jan 13, 2025
    status: "succeeded",
    to: "0x6f71...a98o",
    from: "Your wallet",
    network: "Solana",
    fee: 0.1,
    description: "Withdrew to Solana network"
  },
  {
    id: "9",
    type: "unstake",
    title: "Unstake",
    amount: 300,
    currency: "LPT",
    date: new Date(2025, 0, 12), // Jan 12, 2025
    status: "succeeded",
    to: "Your wallet",
    from: "streamplace.eth",
    network: "Arbitrum One",
    fee: 0.15,
    description: "Unstaked from validator"
  },
  {
    id: "10",
    type: "withdraw-stake",
    title: "Withdraw stake",
    amount: 100,
    currency: "LPT",
    date: new Date(2025, 0, 11), // Jan 11, 2025
    status: "succeeded",
    to: "Your wallet",
    from: "ipt.moudi.eth",
    network: "Arbitrum One",
    fee: 0.05,
    description: "Withdrew staked funds"
  }
];

export const getTransactionGroups = (): TransactionGroup[] => {
  const groups: { [key: string]: Transaction[] } = {};
  
  transactions.forEach(transaction => {
    const dateKey = transaction.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
  });
  
  return Object.entries(groups)
    .map(([date, transactions]) => ({
      date,
      transactions: transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
};
