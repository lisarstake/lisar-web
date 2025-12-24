import React from 'react';
import { EarnPage } from '@/components/earn/EarnPage';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function EarnPageScreen() {
  // Track earn page visit
  usePageTracking('Earn Page', { page_type: 'earn' });
  
  return <EarnPage />;
}
