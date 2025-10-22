import { Transaction } from '../types/transaction';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'fund-wallet',
    title: 'Wallet funding',
    amount: 5000,
    currency: 'LPT',
    date: new Date('2024-01-15T10:30:00Z'),
    status: 'succeeded',
    network: 'Ethereum',
    fee: 0.5,
    from: '0x1234...5678',
    to: '0x9abc...def0'
  },
  {
    id: '2',
    type: 'stake',
    title: 'Stake to validator',
    amount: 2500,
    currency: 'LPT',
    date: new Date('2024-01-14T15:45:00Z'),
    status: 'succeeded',
    network: 'Livepeer',
    fee: 0.1,
    from: '0x9abc...def0',
    to: 'streamplace.eth'
  },
  {
    id: '3',
    type: 'unstake',
    title: 'Unstake from validator',
    amount: 1000,
    currency: 'LPT',
    date: new Date('2024-01-13T09:20:00Z'),
    status: 'succeeded',
    network: 'Livepeer',
    fee: 0.1,
    from: 'giga-kubica.eth',
    to: '0x9abc...def0'
  },
  {
    id: '4',
    type: 'withdraw-stake',
    title: 'Withdraw stake',
    amount: 800,
    currency: 'LPT',
    date: new Date('2024-01-12T14:15:00Z'),
    status: 'succeeded',
    network: 'Livepeer',
    fee: 0.05,
    from: '0x9abc...def0',
    to: '0x9abc...def0'
  },
  {
    id: '5',
    type: 'withdrawal',
    title: 'External withdrawal',
    amount: 1200,
    currency: 'USDC',
    date: new Date('2024-01-11T11:30:00Z'),
    status: 'succeeded',
    network: 'Ethereum',
    fee: 2.5,
    from: '0x9abc...def0',
    to: '0x5678...9abc'
  },
  {
    id: '6',
    type: 'fund-wallet',
    title: 'Wallet funding',
    amount: 3000,
    currency: 'LPT',
    date: new Date('2024-01-10T16:45:00Z'),
    status: 'succeeded',
    network: 'Ethereum',
    fee: 0.3,
    from: '0x1234...5678',
    to: '0x9abc...def0'
  },
  {
    id: '7',
    type: 'stake',
    title: 'Stake to validator',
    amount: 1800,
    currency: 'LPT',
    date: new Date('2024-01-09T13:20:00Z'),
    status: 'succeeded',
    network: 'Livepeer',
    fee: 0.1,
    from: '0x9abc...def0',
    to: 'everest-node.eth'
  },
  {
    id: '8',
    type: 'withdraw-stake',
    title: 'Withdraw stake',
    amount: 600,
    currency: 'LPT',
    date: new Date('2024-01-08T08:15:00Z'),
    status: 'succeeded',
    network: 'Livepeer',
    fee: 0.05,
    from: '0x9abc...def0',
    to: '0x9abc...def0'
  },
  {
    id: '9',
    type: 'withdrawal',
    title: 'External withdrawal',
    amount: 900,
    currency: 'SOL',
    date: new Date('2024-01-07T12:30:00Z'),
    status: 'succeeded',
    network: 'Solana',
    fee: 0.01,
    from: '0x9abc...def0',
    to: '0x5678...9abc'
  },
  {
    id: '10',
    type: 'unstake',
    title: 'Unstake from validator',
    amount: 1500,
    currency: 'LPT',
    date: new Date('2024-01-06T17:45:00Z'),
    status: 'succeeded',
    network: 'Livepeer',
    fee: 0.1,
    from: 'day-dreamer.eth',
    to: '0x9abc...def0'
  }
];

// Helper function to group transactions by date
export const getTransactionGroups = () => {
  const groups: { [key: string]: Transaction[] } = {};
  
  mockTransactions.forEach(transaction => {
    const date = transaction.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
  });
  
  // Convert to array format expected by the component
  return Object.entries(groups).map(([date, transactions]) => ({
    date,
    transactions
  }));
};