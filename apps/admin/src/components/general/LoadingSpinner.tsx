/**
 * Loading Spinner Component
 * Consistent loading state with admin design system (white background)
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
    ? "fixed inset-0 z-50 bg-white flex items-center justify-center"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            {/* Outer ring */}
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            {/* Animated ring */}
            <div className="absolute inset-0 border-4 border-transparent border-t-[#235538] rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading text */}
        {/* <p className="text-gray-900 text-sm font-medium">{message}</p> */}
      </div>
    </div>
  );
};

export default LoadingSpinner;

