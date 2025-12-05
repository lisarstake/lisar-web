/**
 * usePageTracking Hook
 * Automatically tracks page views when component mounts
 */

import { useEffect } from 'react';
import { trackPageView } from '@/lib/mixpanel';

export const usePageTracking = (pageName: string, properties?: Record<string, any>) => {
  useEffect(() => {
    trackPageView(pageName, properties);
  }, [pageName, properties]);
};

