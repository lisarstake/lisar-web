import React, { useState } from "react";
import { OrchestratorResponse } from "@/services/delegation/types";
import { ExternalLink, Twitter, Github } from "lucide-react";

interface ValidatorAboutSectionProps {
  validator: OrchestratorResponse | undefined;
  hasStakeWithValidator: boolean;
  hasWithdrawableAmount: boolean;
  hasPendingUnbonding: boolean;
  totalStakedAmount: number;
  totalWithdrawableAmount: number;
  totalPendingAmount: number;
  unbondingTimeRemaining?: string | null;
}

export const ValidatorAboutSection: React.FC<ValidatorAboutSectionProps> = ({
  validator,
  hasStakeWithValidator,
  hasWithdrawableAmount,
  hasPendingUnbonding,
  totalStakedAmount,
  totalWithdrawableAmount,
  totalPendingAmount,
  unbondingTimeRemaining,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const description =
    validator?.ensIdentity?.description ||
    validator?.description ||
    "Livepeer transcoder";

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
        {/* ENS Identity Avatar */}
        {validator?.ensIdentity?.avatar && (
          <div className="flex justify-center py-2">
            <img
              src={validator.ensIdentity.avatar}
              alt={validator.ensIdentity.name || validator.ensName}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#C7EF6B]"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <p
            className={`text-gray-300 text-xs leading-relaxed ${!isExpanded ? "line-clamp-2" : ""}`}
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          />
          {description && description.length > 100 && (
            <div className="flex justify-start mt-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#C7EF6B] hover:text-[#C7EF6B] transition-colors text-xs"
              >
                {isExpanded ? "Read less" : "Read more"}
              </button>
            </div>
          )}
        </div>

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
              {validator?.apy || "0%"} %
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
                {hasWithdrawableAmount ? (
                  "Unbonded"
                ) : unbondingTimeRemaining ? (
                  <>
                    Unbonding{" "}
                    <span className="text-xs text-gray-500">
                      ({unbondingTimeRemaining})
                    </span>
                  </>
                ) : (
                  "Unbonding"
                )}
              </span>
              <div className="text-right">
                {hasWithdrawableAmount && (
                  <div className="text-[#C7EF6B] font-medium text-sm">
                    {totalWithdrawableAmount.toFixed(2)} LPT
                  </div>
                )}
                {hasPendingUnbonding && (
                  <div>
                    <div className="text-[#C7EF6B] font-medium text-sm">
                      {totalPendingAmount.toFixed(2)} LPT
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400 text-sm">Total Stake</span>
            <span className="text-gray-300 font-medium">
              {validator ? parseFloat(validator.totalStake).toFixed(0) : "0"}{" "}
              LPT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
