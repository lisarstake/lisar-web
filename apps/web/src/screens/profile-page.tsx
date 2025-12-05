import React from 'react';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function ProfilePageScreen() {
  // Track profile page visit
  usePageTracking('Profile Page', { page_type: 'profile' });
  
  return <ProfilePage />;
}
