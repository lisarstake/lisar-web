import React from 'react';
import { WalletPage } from '@/components/wallet/WalletPage';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function WalletPageScreen() {
  // Track wallet page visit
  usePageTracking('Wallet Page', { page_type: 'wallet' });
  
  return <WalletPage />;
}
