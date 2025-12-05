import React from 'react';
import { PortfolioPage } from '@/components/portfolio/PortfolioPage';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function PortfolioPageScreen() {
  // Track portfolio page visit
  usePageTracking('Portfolio Page', { page_type: 'portfolio' });
  
  return <PortfolioPage />;
}
