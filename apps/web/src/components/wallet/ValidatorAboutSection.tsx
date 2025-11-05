import React from "react";
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
        <p className="text-gray-300 text-xs leading-relaxed">
          {validator?.ensIdentity?.description || validator?.description || "Livepeer transcoder"}
        </p>

        {/* Social Links */}
        {(validator?.ensIdentity?.url || validator?.ensIdentity?.twitter || validator?.ensIdentity?.github) && (
          <div className="flex items-center gap-3 pt-2">
            {validator?.ensIdentity?.url && (
              <a
                href={validator.ensIdentity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#86B3F7] hover:text-[#C7EF6B] transition-colors text-xs"
              >
                <ExternalLink size={14} />
                <span>Website</span>
              </a>
            )}
            {validator?.ensIdentity?.twitter && (
              <a
                href={`https://twitter.com/${validator.ensIdentity.twitter.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#86B3F7] hover:text-[#C7EF6B] transition-colors text-xs"
              >
                <Twitter size={14} />
                <span>Twitter</span>
              </a>
            )}
            {validator?.ensIdentity?.github && (
              <a
                href={`https://github.com/${validator.ensIdentity.github.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#86B3F7] hover:text-[#C7EF6B] transition-colors text-xs"
              >
                <Github size={14} />
                <span>GitHub</span>
              </a>
            )}
          </div>
        )}

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

