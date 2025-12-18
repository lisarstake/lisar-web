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
  return (
    <div className="flex items-center justify-around px-6 py-6">
      <button
        onClick={onStakeClick}
        className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
      >
        <PiggyBank size={24} color="#C7EF6B" />
        <span className="text-gray-300 text-xs">Vest</span>
      </button>

      <button
        onClick={onUnstakeClick}
        disabled={!hasStakeWithValidator}
        className={`flex flex-col items-center justify-center space-y-2 w-20 h-20 rounded-xl transition-colors ${
          hasStakeWithValidator
            ? "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            : "bg-[#1a1a1a] cursor-not-allowed"
        }`}
      >
        <SquareMinus
          size={20}
          color={hasStakeWithValidator ? "#C7EF6B" : "#666666"}
        />
        <span
          className={`text-xs ${hasStakeWithValidator ? "text-gray-300" : "text-gray-500"}`}
        >
          Unvest
        </span>
      </button>

      <button
        onClick={onWithdrawClick}
        disabled={!hasWithdrawableAmount}
        className={`flex flex-col items-center justify-center space-y-2 w-20 h-20 rounded-xl transition-colors ${
          hasWithdrawableAmount
            ? "bg-[#2a2a2a] hover:bg-[#3a3a3a]"
            : "bg-[#1a1a1a] cursor-not-allowed"
        }`}
      >
        <ArrowUpRight
          size={20}
          color={hasWithdrawableAmount ? "#C7EF6B" : "#666666"}
        />
        <span
          className={`text-xs ${hasWithdrawableAmount ? "text-gray-300" : "text-gray-500"}`}
        >
          Withdraw
        </span>
      </button>

      <button
        onClick={onShareClick}
        className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
      >
        <Share size={20} color="#C7EF6B" />
        <span className="text-gray-300 text-xs">Share</span>
      </button>
    </div>
  );
};

