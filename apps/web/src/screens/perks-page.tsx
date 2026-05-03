import React from 'react';
import { PerksPage } from '@/components/perks/PerksPage';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function PerksPageScreen() {
  // Track perks page visit
  usePageTracking('Perks Page', { page_type: 'perks' });
  
  return <PerksPage />;
}
