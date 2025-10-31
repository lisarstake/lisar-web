import React from 'react';

interface OnboardingPaginationProps {
  currentScreen: number;
  totalScreens: number;
}

export const OnboardingPagination: React.FC<OnboardingPaginationProps> = ({
  currentScreen,
  totalScreens,
}) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      {Array.from({ length: totalScreens }, (_, index) => {
        const isActive = index === currentScreen;
        return (
          <div
            key={index}
            className={`transition-all duration-300 ${
              isActive
                ? 'w-20 h-3 bg-[#C7EF6B] rounded-full'
                : 'w-3 h-3 bg-white/30 rounded-full'
            }`}
          />
        );
      })}
    </div>
  );
};
