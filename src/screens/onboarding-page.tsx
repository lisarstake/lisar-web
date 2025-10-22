import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingFlow } from '@/components/onboarding';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to home page after onboarding completion
    navigate('/');
  };

  const handleSkip = () => {
    // Navigate to home page when skipping onboarding
    navigate('/');
  };

  return (
    <OnboardingFlow 
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
};

export default OnboardingPage;
