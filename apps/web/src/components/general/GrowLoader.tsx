import React from "react";

interface GrowLoaderProps {
  isVisible: boolean;
}

export const GrowLoader: React.FC<GrowLoaderProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#181818] flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center">
          <img
            src="/grow1.png"
            alt="Grow"
            className="w-44 h-44 object-contain"
            style={{
              animation: "scalePulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes scalePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

