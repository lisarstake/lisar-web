import React from "react";
import { ChartSpline, Send, ChartPie, History } from "lucide-react";

interface WalletActionButtonsProps {
  onDepositClick: () => void;
  onStakeClick: () => void;
  onPortfolioClick: () => void;
  onHistoryClick: () => void;
}

export const WalletActionButtons: React.FC<WalletActionButtonsProps> = ({
  onDepositClick,
  onStakeClick,
  onPortfolioClick,
  onHistoryClick,
}) => {
  return (
    <div className="flex items-center justify-around px-6 py-6">
      <button
        onClick={onDepositClick}
        className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
      >
        <Send size={16} color="#C7EF6B" />
        <span className="text-gray-300 text-xs">Deposit</span>
      </button>

      <button
        onClick={onStakeClick}
        className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
      >
        <ChartSpline size={16} color="#C7EF6B" />
        <span className="text-gray-300 text-xs">Stake</span>
      </button>

      <button
        onClick={onPortfolioClick}
        className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
      >
        <ChartPie size={16} color="#C7EF6B" />
        <span className="text-gray-300 text-xs">Portfolio</span>
      </button>

      <button
        onClick={onHistoryClick}
        className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
      >
        <History size={16} color="#C7EF6B" />
        <span className="text-gray-300 text-xs">History</span>
      </button>
    </div>
  );
};

