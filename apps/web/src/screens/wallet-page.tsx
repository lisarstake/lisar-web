import React from 'react';
import { useParams } from 'react-router-dom';
import { WalletPage } from '@/components/wallet/WalletPage';
import { AllWalletPage } from '@/components/wallet/AllWalletPage';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function WalletPageScreen() {
  const { walletType } = useParams<{ walletType?: string }>();
  
  // Track wallet page visit
  usePageTracking('Wallet Page', { page_type: 'wallet', wallet_type: walletType });
  
  // If walletType is provided, show the specific wallet page with action buttons
  // Otherwise, show the all wallets page with carousel
  if (walletType) {
    return <WalletPage walletType={walletType} />;
  }
  
  return <AllWalletPage />;
}
