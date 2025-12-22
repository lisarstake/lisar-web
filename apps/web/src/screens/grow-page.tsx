import React from 'react';
import { GrowPage } from '@/components/wallet/GrowPage';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function GrowPageScreen() {
  // Track grow page visit
  usePageTracking('Grow Page', { page_type: 'grow' });
  
  return <GrowPage />;
}

