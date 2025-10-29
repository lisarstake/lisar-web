import React from "react";
import { OrchestratorResponse } from "@/services/delegation/types";

interface ValidatorAboutSectionProps {
  validator: OrchestratorResponse | undefined;
  hasStakeWithValidator: boolean;
  hasWithdrawableAmount: boolean;
  hasPendingUnbonding: boolean;
  totalStakedAmount: number;
  totalWithdrawableAmount: number;
  totalPendingAmount: number;
}

export const ValidatorAboutSection: React.FC<ValidatorAboutSectionProps> = ({
  validator,
  hasStakeWithValidator,
  hasWithdrawableAmount,
  hasPendingUnbonding,
  totalStakedAmount,
  totalWithdrawableAmount,
  totalPendingAmount,
}) => {
  return (
    <div
      className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <h3 className="text-lg font-semibold text-white mb-2">About</h3>

      <div className="space-y-4">
        <p className="text-gray-300 text-xs leading-relaxed">
          {validator?.description || "Livepeer transcoder"}
        </p>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400 text-sm">Status</span>
            <span
              className={`font-medium ${validator?.active ? "text-green-400" : "text-red-400"}`}
            >
              {validator?.active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400 text-sm">Fee</span>
            <span className="text-gray-300 font-medium">
              {validator?.reward
                ? (parseFloat(validator.reward) / 10000).toFixed(1) + "%"
                : "0%"}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400 text-sm">APY</span>
            <span className="text-[#C7EF6B] font-medium">
              {validator?.apy || "0%"}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400 text-sm">Staked</span>
            <span className="text-[#C7EF6B] font-medium">
              {hasStakeWithValidator
                ? `${totalStakedAmount.toFixed(2)} LPT`
                : "None"}
            </span>
          </div>

          {(hasWithdrawableAmount || hasPendingUnbonding) && (
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">
                {hasWithdrawableAmount ? "Unbonded" : "Unbonding"}
              </span>
              <div className="text-right">
                {hasWithdrawableAmount && (
                  <div className="text-[#C7EF6B] font-medium text-sm">
                    {totalWithdrawableAmount.toFixed(2)} LPT
                  </div>
                )}
                {hasPendingUnbonding && (
                  <div className="text-yellow-400 font-medium text-sm">
                    {totalPendingAmount.toFixed(2)} LPT
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400 text-sm">Total Stake</span>
            <span className="text-gray-300 font-medium">
              {validator
                ? parseFloat(validator.totalStake).toFixed(0)
                : "0"}{" "}
              LPT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

