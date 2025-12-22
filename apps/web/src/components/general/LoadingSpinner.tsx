/**
 * Loading Spinner Component
 * Consistent loading state with app design
 */

import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  fullScreen = true,
}) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 bg-[#181818] flex items-center justify-center"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-[#2a2a2a] rounded-full"></div>
            {/* Animated ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-[#C7EF6B] rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading text */}
        {/* <p className="text-white text-sm font-medium">{message}</p> */}
      </div>
    </div>
  );
};

export default LoadingSpinner;
