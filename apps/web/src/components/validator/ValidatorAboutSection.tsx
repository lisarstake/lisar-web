import React, { useState } from "react";
import { OrchestratorResponse } from "@/services/delegation/types";
import {
  ExternalLink,
  Twitter,
  Github,
  TrendingUp,
  Percent,
  Lock,
  Clock,
  Coins,
} from "lucide-react";

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

      <div className="space-y-4">
        {/* Description */}
        {/* <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
          <h4 className="text-white font-semibold text-sm mb-2">
            About
          </h4>
          <p
            className={`text-gray-300 text-xs leading-relaxed ${!isExpanded ? "line-clamp-2" : ""}`}
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          />
          {description && description.length > 100 && (
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#C7EF6B] hover:text-[#B8E55A] transition-colors text-xs font-medium"
              >
                {isExpanded ? "Read less" : "Read more"}
              </button>
            </div>
          )}
        </div> */}

        {/* Validator Details */}
        <h4 className="text-white/90 font-medium text-base mb-4 ml-1">
          About validator
        </h4>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
          <div className="space-y-4">
            {/* APY */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                  <TrendingUp size={14} color="#C7EF6B" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Annual Yield</span>
                </div>
              </div>
              <span className="font-medium text-sm">
                {validator?.apy || "0"}%
              </span>
            </div>

            {/* Fee */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                  <Percent size={14} color="#86B3F7" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Reward Cut</span>
                </div>
              </div>
              <span className="text-white/90 font-medium text-sm">
                {validator?.reward
                  ? (parseFloat(validator.reward) / 10000).toFixed(1)
                  : "0"}
                %
              </span>
            </div>

            {/* Total Stake */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                  <Coins size={14} color="#ffffff" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Total Stake</span>
                </div>
              </div>
              <span className="text-white/90 font-medium text-sm">
                {validator ? parseFloat(validator.totalStake).toFixed(0) : "0"}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 ${validator?.active ? "bg-white/10" : "bg-white/10"} rounded-lg flex items-center justify-center`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${validator?.active ? "bg-green-400" : "bg-red-400"} `}
                  ></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">
                    Validator Status
                  </span>
                </div>
              </div>
              <span className={`font-medium text-sm`}>
                {validator?.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Your Position (if any) */}
        {(hasStakeWithValidator ||
          hasWithdrawableAmount ||
          hasPendingUnbonding) && (
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
            <h4 className="text-white/90 font-semibold text-sm mb-4">
              My Position
            </h4>
            <div className="space-y-3">
              {hasStakeWithValidator && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-[#C7EF6B]/20 rounded-lg flex items-center justify-center">
                      <Lock size={14} color="#C7EF6B" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">
                        Currently Staked
                      </span>
                    </div>
                  </div>
                  <span className="font-medium text-sm">
                    {totalStakedAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {hasWithdrawableAmount && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Coins size={14} color="#4ade80" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">
                        Ready to Withdraw
                      </span>
                    </div>
                  </div>
                  <span className="font-medium text-sm">
                    {totalWithdrawableAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {hasPendingUnbonding && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Clock size={14} color="#fbbf24" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Withdrawing</span>
                    </div>
                  </div>
                  <span className="font-medium text-sm">
                    {totalPendingAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
