import React from "react";
import { ChartSpline, Send, ChartPie, SquareArrowDown, Plus, HandCoins, PiggyBank } from "lucide-react";

interface WalletActionButtonsProps {
  onDepositClick: () => void;
  onStakeClick: () => void;
  onPortfolioClick: () => void;
  onWithdrawClick: () => void;
  walletType?: string;
}

export const WalletActionButtons: React.FC<WalletActionButtonsProps> = ({
  onDepositClick,
  onStakeClick,
  onPortfolioClick,
  onWithdrawClick,
  walletType,
}) => {
  // Determine colors based on wallet type
  const isStables = walletType === "savings";
  const isHighYield = walletType === "staking";
  
  const buttonBgColor = isStables 
    ? "bg-[#86B3F7]/20" 
    : isHighYield 
      ? "bg-[#C7EF6B]/20"
      : "bg-[#2a2a2a]";
  
  const iconColor = isStables 
    ? "#86B3F7" 
    : isHighYield 
      ? "#C7EF6B"
      : "#C7EF6B";
  
  const textColor = isStables || isHighYield
    ? "text-white"
    : "text-gray-300";

  return (
    <div className="flex items-center justify-around px-6 py-2">
      <div className="flex flex-col items-center">
        <button
          data-tour="deposit-button"
          onClick={onDepositClick}
          className={`flex items-center justify-center w-14 h-14 ${buttonBgColor} rounded-xl transition-colors hover:opacity-80`}
        >
          <Plus size={25} color={iconColor} />
        </button>
        <span className="text-white/80 text-xs mt-2">Top up</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          data-tour="stake-button"
          onClick={onStakeClick}
          className={`flex items-center justify-center w-14 h-14 ${buttonBgColor} rounded-xl transition-colors hover:opacity-80`}
        >
          <PiggyBank size={25} color={iconColor} />
        </button>
        <span className="text-white/80 text-xs mt-2">Save</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          data-tour="portfolio-button"
          onClick={onPortfolioClick}
          className={`flex items-center justify-center w-14 h-14 ${buttonBgColor} rounded-xl transition-colors hover:opacity-80`}
        >
          <ChartPie size={22} color={iconColor} />
        </button>
        <span className="text-white/80 text-xs mt-2">Portfolio</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          data-tour="withdraw-button"
          onClick={onWithdrawClick}
          className={`flex items-center justify-center w-14 h-14 ${buttonBgColor} rounded-xl transition-colors hover:opacity-80`}
        >
          <Send size={22} color={iconColor} />
        </button>
        <span className="text-white/80 text-xs mt-2">Withdraw</span>
      </div>
    </div>
  );
};

