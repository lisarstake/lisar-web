/**
 * Loading Spinner Component
 */

import React, { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  fullScreen = true,
}) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.2 : 1));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 bg-[#050505] flex items-center justify-center"
    : "flex items-center justify-center py-12";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {/* Animated Lisar Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/lisar.png"
            alt="Lisar"
            className="object-contain"
            style={{
              width: 80,
              height: 80,
              transform: `scale(${scale})`,
              transition: "transform 800ms ease-in-out",
              filter:
                "brightness(0) saturate(100%) invert(83%) sepia(21%) saturate(864%) hue-rotate(48deg) brightness(98%) contrast(108%)",
            }}
          />
        </div>

        {/* Loading text */}
        {/* <p className="text-white text-sm font-medium">{message}</p> */}
      </div>
    </div>
  );
};

export default LoadingSpinner;
