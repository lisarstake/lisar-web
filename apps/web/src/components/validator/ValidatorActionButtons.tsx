import React from "react";
import {
  ChartSpline,
  SquareMinus,
  ArrowUpRight,
  Share,
  PiggyBank,
} from "lucide-react";
import { OrchestratorResponse } from "@/services/delegation/types";

interface ValidatorActionButtonsProps {
  validator: OrchestratorResponse | undefined;
  hasStakeWithValidator: boolean;
  hasWithdrawableAmount: boolean;
  onStakeClick: () => void;
  onUnstakeClick: () => void;
  onWithdrawClick: () => void;
  onShareClick: () => void;
}

export const ValidatorActionButtons: React.FC<ValidatorActionButtonsProps> = ({
  validator,
  hasStakeWithValidator,
  hasWithdrawableAmount,
  onStakeClick,
  onUnstakeClick,
  onWithdrawClick,
  onShareClick,
}) => {
  const blacklistedAddress = "0x882bac0da055d1826ee637c410c8d4c99be8b485";
  const isBlacklisted = validator?.address?.toLowerCase() === blacklistedAddress.toLowerCase();

  return (
    <div className="flex items-center justify-around px-6 py-6">
      <button
        onClick={onStakeClick}
        // disabled={isBlacklisted}
        className={`flex flex-col items-center justify-center space-y-2 w-20 h-20 rounded-xl transition-colors ${
          isBlacklisted
            ? "bg-[#1a1a1a] cursor-not-allowed"
            : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
        }`}
      >
        <PiggyBank size={24} color={"#C7EF6B"} />
        <span className={`text-xs text-gray-300`}>{isBlacklisted ? "Activate" : "Vest"}</span>
      </button>

      <button
        onClick={onUnstakeClick}
        disabled={!hasStakeWithValidator || isBlacklisted}
        className={`flex flex-col items-center justify-center space-y-2 w-20 h-20 rounded-xl transition-colors ${
          hasStakeWithValidator && !isBlacklisted
            ? "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            : "bg-[#1a1a1a] cursor-not-allowed"
        }`}
      >
        <SquareMinus
          size={20}
          color={hasStakeWithValidator && !isBlacklisted ? "#C7EF6B" : "#666666"}
        />
        <span
          className={`text-xs ${hasStakeWithValidator && !isBlacklisted ? "text-gray-300" : "text-gray-500"}`}
        >
          Unvest
        </span>
      </button>

      <button
        onClick={onWithdrawClick}
        disabled={!hasWithdrawableAmount || isBlacklisted}
        className={`flex flex-col items-center justify-center space-y-2 w-20 h-20 rounded-xl transition-colors ${
          hasWithdrawableAmount && !isBlacklisted
            ? "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            : "bg-[#1a1a1a] cursor-not-allowed"
        }`}
      >
        <ArrowUpRight
          size={20}
          color={hasWithdrawableAmount && !isBlacklisted ? "#C7EF6B" : "#666666"}
        />
        <span
          className={`text-xs ${hasWithdrawableAmount && !isBlacklisted ? "text-gray-300" : "text-gray-500"}`}
        >
          Withdraw
        </span>
      </button>

      <button
        onClick={onShareClick}
        disabled={isBlacklisted}
        className={`flex flex-col items-center justify-center space-y-2 w-20 h-20 rounded-xl transition-colors ${
          isBlacklisted
            ? "bg-[#1a1a1a] cursor-not-allowed"
            : "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
        }`}
      >
        <Share size={20} color={isBlacklisted ? "#666666" : "#C7EF6B"} />
        <span className={`text-xs ${isBlacklisted ? "text-gray-500" : "text-gray-300"}`}>Share</span>
      </button>
    </div>
  );
};

