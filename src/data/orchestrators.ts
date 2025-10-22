import { Orchestrator } from '@/types/wallet';

export const orchestrators: Orchestrator[] = [
  {
    id: '1',
    name: 'streamplace.eth',
    icon: '🟣', // Pink cube
    totalStaked: 2508,
    apy: 65.6,
    fee: 0
  },
  {
    id: '2',
    name: 'neuralstream.eth',
    icon: '🟢', // Green cloud
    totalStaked: 1890,
    apy: 58.2,
    fee: 0
  },
  {
    id: '3',
    name: 'ipt.moudi.eth',
    icon: '🔵', // Blue patterned circle
    totalStaked: 3200,
    apy: 72.1,
    fee: 0
  },
  {
    id: '4',
    name: 'coef120.eth',
    icon: '🟦', // Blue jellyfish
    totalStaked: 1450,
    apy: 61.8,
    fee: 0
  }
];

export const walletData = {
  balance: 8000,
  currency: 'LPT',
  fiatValue: '100,000',
  fiatCurrency: '₦'
};
