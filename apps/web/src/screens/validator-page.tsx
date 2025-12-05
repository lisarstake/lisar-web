import React from 'react';
import { ValidatorPage } from '@/components/validator/ValidatorPage';
import { usePageTracking } from '@/hooks/usePageTracking';

export default function ValidatorPageScreen() {
  // Track validators page visit
  usePageTracking('Validators Page', { page_type: 'validators' });
  
  return <ValidatorPage />;
}
