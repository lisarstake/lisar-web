import React from "react";
import { ChartSpline, Send, ChartPie, SquareArrowDown } from "lucide-react";

interface WalletActionButtonsProps {
  onDepositClick: () => void;
  onStakeClick: () => void;
  onPortfolioClick: () => void;
  onWithdrawClick: () => void;
}

export const WalletActionButtons: React.FC<WalletActionButtonsProps> = ({
  onDepositClick,
  onStakeClick,
  onPortfolioClick,
  onWithdrawClick,
}) => {
  return (
    <div className="flex items-center justify-around px-6 py-6">
      <button
        data-tour="deposit-button"
        onClick={onDepositClick}
        className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
      >
        <SquareArrowDown size={18} color="#C7EF6B" />
        <span className="text-gray-300 text-xs">Deposit</span>
      </button>

      <button
        data-tour="stake-button"
        onClick={onStakeClick}
        className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
      >
        <ChartSpline size={16} color="#C7EF6B" />
        <span className="text-gray-300 text-xs">Stake</span>
      </button>

      <button
        data-tour="portfolio-button"
        onClick={onPortfolioClick}
        className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
      >
        <ChartPie size={16} color="#C7EF6B" />
        <span className="text-gray-300 text-xs">Portfolio</span>
      </button>

      <button
        data-tour="withdraw-button"
        onClick={onWithdrawClick}
        className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
      >
        <Send size={16} color="#C7EF6B" />
        <span className="text-gray-300 text-xs">Withdraw</span>
      </button>
    </div>
  );
};

