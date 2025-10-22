export interface Orchestrator {
  id: string;
  name: string;
  icon: string;
  totalStaked: number;
  apy: number;
  fee: number;
}

export interface WalletData {
  balance: number;
  currency: string;
  fiatValue: string;
  fiatCurrency: string;
}

export type FilterType = 'apy' | 'total-stake' | 'active-time';
