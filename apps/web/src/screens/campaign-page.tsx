import React from 'react';
import { CampaignHomePage } from '@/components/campaign/CampaignHomePage';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function CampaignPageScreen() {
  // Track campaign page visit
  usePageTracking('Campaign Home Page', { page_type: 'campaign' });
  
  return <CampaignHomePage />;
}
