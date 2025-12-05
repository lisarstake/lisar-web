import React from 'react';
import { PublicDashboard } from '@/components/dashboard/PublicDashboard';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function DashboardPageScreen() {
  // Track dashboard page visit
  usePageTracking('Dashboard Page', { page_type: 'dashboard' });
  
  return <PublicDashboard />;
}
