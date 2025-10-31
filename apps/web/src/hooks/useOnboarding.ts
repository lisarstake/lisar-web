import { useState, useEffect } from 'react';

interface UseOnboardingReturn {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  isOnboardingActive: boolean;
  setOnboardingActive: (active: boolean) => void;
}

const ONBOARDING_KEY = 'lisar_onboarding_completed';

/**
 * Custom hook for managing onboarding state
 * Persists onboarding completion status in localStorage
 */
export const useOnboarding = (): UseOnboardingReturn => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(false);

  // Load onboarding status from localStorage on mount
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    setHasCompletedOnboarding(completed === 'true');
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setHasCompletedOnboarding(true);
    setIsOnboardingActive(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setHasCompletedOnboarding(false);
    setIsOnboardingActive(true);
  };

  const setOnboardingActive = (active: boolean) => {
    setIsOnboardingActive(active);
  };

  return {
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
    isOnboardingActive,
    setOnboardingActive,
  };
};
