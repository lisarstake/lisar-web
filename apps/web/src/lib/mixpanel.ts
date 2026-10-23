/**
 * Mixpanel Analytics Utilities
 * Helper functions for tracking events throughout the app
 */

import mixpanel from 'mixpanel-browser';

const isEnabled = () => Boolean(import.meta.env.VITE_MIXPANEL_TOKEN);

const safeTrack = (fn: () => void) => {
  try {
    if (isEnabled()) {
      fn();
    }
  } catch (error) {
    console.warn('[Mixpanel] Tracking error ignored:', error);
  }
};

// Track page view
export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  safeTrack(() => {
    mixpanel.track('Page View', {
      page_title: pageName,
      page_url: window.location.href,
      ...properties,
    });
  });
};

// Track blog article read
export const trackBlogRead = (articleId: string, articleTitle: string, category: string, readingTime: number) => {
  safeTrack(() => {
    mixpanel.track('Blog Article Read', {
      article_id: articleId,
      article_title: articleTitle,
      category: category,
      reading_time: readingTime,
      page_url: window.location.href,
    });
  });
};

// Track search
export const trackSearch = (query: string, resultsCount?: number) => {
  safeTrack(() => {
    mixpanel.track('Search', {
      search_query: query,
      results_count: resultsCount,
      page_url: window.location.href,
    });
  });
};

// Track error
export const trackError = (
  errorType: string,
  errorMessage: string,
  errorCode?: string
) => {
  safeTrack(() => {
    mixpanel.track('Error', {
      error_type: errorType,
      error_message: errorMessage,
      error_code: errorCode,
      page_url: window.location.href,
    });
  });
};

// Track conversion (staking actions)
export const trackConversion = (
  conversionType: string,
  conversionValue?: number,
  properties?: Record<string, any>
) => {
  safeTrack(() => {
    mixpanel.track('Conversion', {
      'Conversion Type': conversionType,
      'Conversion Value': conversionValue,
      ...properties,
    });
  });
};

// Track purchase/stake
export const trackPurchase = (
  transactionId: string,
  amount: number,
  currency: string,
  properties?: Record<string, any>
) => {
  safeTrack(() => {
    mixpanel.track('Purchase', {
      user_id: mixpanel.get_distinct_id?.(),
      transaction_id: transactionId,
      revenue: amount,
      currency: currency,
      ...properties,
    });
  });
};

// Track stake action
export const trackStake = (
  action: 'deposit' | 'withdraw' | 'claim',
  amount: number,
  currency: string,
  validatorId?: string
) => {
  safeTrack(() => {
    mixpanel.track('Stake Action', {
      action: action,
      amount: amount,
      currency: currency,
      validator_id: validatorId,
    });
  });

  // Also track as conversion
  trackConversion(`Stake ${action}`, amount, {
    currency,
    validator_id: validatorId,
  });
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  safeTrack(() => {
    mixpanel.track('Button Click', {
      button_name: buttonName,
      location: location,
      page_url: window.location.href,
    });
  });
};

// Track form submission
export const trackFormSubmit = (formName: string, success: boolean) => {
  safeTrack(() => {
    mixpanel.track('Form Submit', {
      form_name: formName,
      success: success,
      page_url: window.location.href,
    });
  });
};

