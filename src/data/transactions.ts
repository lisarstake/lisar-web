import { Transaction, TransactionGroup } from "@/types/transaction";

export const transactions: Transaction[] = [
  {
    id: "1",
    type: "fund-wallet",
    title: "Fund wallet",
    amount: 0.036,
    currency: "LPT",
    date: new Date(),
    status: "succeeded",
    to: "Your wallet",
    from: "External wallet",
    network: "Arbitrum One",
    fee: 0.001,
    description: "Deposited funds to your wallet"
  },
  {
    id: "2",
    type: "withdraw-stake",
    title: "Withdrew stake",
    amount: 0.036,
    currency: "LPT",
    date: new Date(),
    status: "succeeded",
    to: "Alex wallet 0x6f71...a980",
    from: "neuralstream.eth",
    network: "Arbitrum One",
    fee: 0.001,
    description: "Withdrew stake from validator"
  },
  {
    id: "3",
    type: "orchestrator-stake",
    title: "Orchestrator stake",
    amount: 0.036,
    currency: "LPT",
    date: new Date(),
    status: "succeeded",
    to: "neuralstream.eth",
    from: "Your wallet",
    network: "Arbitrum One",
    fee: 0.001,
    description: "Staked with orchestrator"
  },
  {
    id: "4",
    type: "fund-wallet",
    title: "Fund wallet",
    amount: 0.036,
    currency: "LPT",
    date: new Date(2025, 10, 11), // Nov 11, 2025
    status: "succeeded",
    to: "Your wallet",
    from: "External wallet",
    network: "Arbitrum One",
    fee: 0.001,
    description: "Deposited funds to your wallet"
  },
  {
    id: "5",
    type: "withdraw-stake",
    title: "Withdrew stake",
    amount: 0.036,
    currency: "LPT",
    date: new Date(2025, 10, 11), // Nov 11, 2025
    status: "succeeded",
    to: "Alex wallet 0x6f71...a980",
    from: "neuralstream.eth",
    network: "Arbitrum One",
    fee: 0.001,
    description: "Withdrew stake from validator"
  },
  {
    id: "6",
    type: "orchestrator-stake",
    title: "Orchestrator stake",
    amount: 0.036,
    currency: "LPT",
    date: new Date(2025, 10, 11), // Nov 11, 2025
    status: "succeeded",
    to: "neuralstream.eth",
    from: "Your wallet",
    network: "Arbitrum One",
    fee: 0.001,
    description: "Staked with orchestrator"
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
