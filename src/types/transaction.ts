export interface Transaction {
  id: string;
  type: 'fund-wallet' | 'withdraw-stake' | 'orchestrator-stake' | 'unstake' | 'withdrawal';
  title: string;
  amount: number;
  currency: string;
  date: Date;
  status: 'succeeded' | 'pending' | 'failed';
  to?: string;
  from?: string;
  network?: string;
  fee?: number;
  description?: string;
}

export interface TransactionGroup {
  date: string;
  transactions: Transaction[];
}
