import React from 'react';
import { LearnPage } from '@/components/learn/LearnPage';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function LearnPageScreen() {
  // Track learn page visit
  usePageTracking('Learn Page', { page_type: 'learn' });
  
  return <LearnPage />;
}
