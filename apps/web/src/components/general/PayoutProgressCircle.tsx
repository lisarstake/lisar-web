import React, { useState } from "react";
import { HelpDrawer } from "./HelpDrawer";

interface PayoutProgressCircleProps {
  progress: number;
  timeRemaining: string;
  isSavings?: boolean;
}

export const PayoutProgressCircle: React.FC<PayoutProgressCircleProps> = ({
  progress,
  timeRemaining,
  isSavings = false,
}) => {
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowHelpDrawer(true);
        }}
        className="relative w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto"
        aria-label="View payout information"
        style={{ zIndex: 20 }}
      >
        <svg className="transform -rotate-90 w-12 h-12 pointer-events-none">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke={isSavings ? "#86B3F7" : "#2a2a2a"}
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke={isSavings ? "#ffffff" : "#C7EF6B"}
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${(progress / 100) * 125.6} 125.6`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={`${isSavings ? "text-[#ffffff]" : "text-[#C7EF6B]"} text-[9px] font-bold`}
          >
            {timeRemaining}
          </span>
        </div>
      </button>

      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="What is this?"
        content={[
          "This indicator shows when your next rewards will be paid out.",
          "Rewards are distributed automatically once the cycle completes.",
        ]}
      />
    </>
  );
};
