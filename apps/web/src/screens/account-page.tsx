import React from 'react';
import { AccountPage } from '@/components/account/AccountPage';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function AccountPageScreen() {
  // Track account page visit
  usePageTracking('Account Page', { page_type: 'account' });
  
  return <AccountPage />;
}

