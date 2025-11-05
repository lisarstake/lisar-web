import React from 'react';

interface OnboardingIllustrationProps {
  svgPath: string;
}

export const OnboardingIllustration: React.FC<OnboardingIllustrationProps> = ({ svgPath }) => {
  return (
    <div className="w-96 h-80 flex items-end justify-end">
      <img
        src={svgPath}
        alt="Onboarding illustration"
        className="w-full h-full object-contain drop-shadow-2xl"
      />
    </div>
  );
};
