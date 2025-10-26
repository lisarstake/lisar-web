import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  CircleQuestionMark,
  ArrowUpRight,
  Share,
  ChartSpline,
  SquareMinus,
} from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { ShareDrawer } from "@/components/general/ShareDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { OrchestratorResponse } from "@/services/delegation/types";

export const ValidatorDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { validatorId } = useParams<{ validatorId: string }>();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const { orchestrators, userDelegation, isLoading, error } =
    useOrchestrators();

  // Find the orchestrator by address (validatorId is the address)
  const currentValidator = orchestrators.find(
    (orch) => orch.address === validatorId
  );

  // Check if user has a stake with this orchestrator
  const hasStakeWithValidator =
    userDelegation &&
    userDelegation.delegate.id === validatorId &&
    parseFloat(userDelegation.bondedAmount) > 0;

  // Check for unbonding locks for this validator
  const unbondingLocksForValidator =
    userDelegation?.unbondingLocks?.filter(
      (lock) => lock.delegate.id === validatorId
    ) || [];

  // Calculate if withdraw is available (7 days = ~8 rounds for safety, each round is 22h 40min)
  const currentRound = userDelegation?.lastClaimRound?.id
    ? parseInt(userDelegation.lastClaimRound.id)
    : 0;
  const UNBONDING_ROUNDS = 8; // 8 rounds for safety (7+ days)

  const withdrawableLocks = unbondingLocksForValidator.filter((lock) => {
    const withdrawRound = parseInt(lock.withdrawRound);
    return currentRound >= withdrawRound + UNBONDING_ROUNDS;
  });

  const pendingUnbondingLocks = unbondingLocksForValidator.filter((lock) => {
    const withdrawRound = parseInt(lock.withdrawRound);
    return currentRound < withdrawRound + UNBONDING_ROUNDS;
  });

  const hasWithdrawableAmount = withdrawableLocks.length > 0;
  const hasPendingUnbonding = pendingUnbondingLocks.length > 0;

  // If not found, redirect back to validator page
  if (!isLoading && !currentValidator && !error) {
    navigate("/validator");
    return null;
  }

  const handleBackClick = () => {
    // Check if we came from portfolio or validator page
    if (document.referrer.includes("/portfolio")) {
      navigate("/portfolio");
    } else {
      navigate("/validator");
    }
  };

  const handleStakeClick = () => {
    navigate(`/stake/${currentValidator?.address}`);
  };

  const handleWithdrawClick = () => {
    navigate(`/withdraw-network/${currentValidator?.address}`);
  };

  const handleUnstakeClick = () => {
    navigate(`/unstake-amount/${currentValidator?.address}`);
  };

  const handleShareClick = () => {
    setShowShareDrawer(true);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-[#050505] text-white flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C7EF6B]"></div>
          <span className="ml-3 text-gray-400">Loading validator...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen bg-[#050505] text-white flex flex-col">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate("/validator")}
              className="px-4 py-2 bg-[#C7EF6B] text-black rounded-lg font-medium hover:bg-[#B8E55A] transition-colors"
            >
              Back to Validators
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>

        <h1 className="text-lg font-medium text-white">
          {currentValidator?.ensName
            ? currentValidator.ensName.length > 16
              ? currentValidator.ensName.slice(0, 16) + ".."
              : currentValidator.ensName
            : "Unknown V.."}
        </h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Current Round */}
      <div className="px-6 py-4 text-center">
        <p className="text-white/70 text-sm mb-2">Total Stake</p>
        <h2 className="text-2xl font-bold text-white">
          {currentValidator
            ? Math.round(
                parseFloat(currentValidator.totalStake)
              ).toLocaleString()
            : "0"}{" "}
          LPT
        </h2>
      </div>

      {/* Graph Section */}
      <div className="px-6 py-4">
        <div className="bg-[#1a1a1a] rounded-xl">
          <div className="h-32 bg-[#0a0a0a] rounded-lg relative overflow-hidden">
            {/* Mock graph line */}
            <svg className="w-full h-full" viewBox="0 0 300 100">
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#C7EF6B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#C7EF6B" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                d="M 20 80 Q 60 40 100 50 T 180 30 T 260 40"
                stroke="#C7EF6B"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 20 80 Q 60 40 100 50 T 180 30 T 260 40 L 260 100 L 20 100 Z"
                fill="url(#lineGradient)"
              />
              {/* Highlight line for Round 2390 */}
              <line
                x1="180"
                y1="0"
                x2="180"
                y2="100"
                stroke="#FFD700"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              {/* Tooltip */}
              <rect
                x="160"
                y="10"
                width="40"
                height="20"
                fill="#FFD700"
                rx="4"
              />
              <text
                x="180"
                y="22"
                textAnchor="middle"
                fill="#000"
                fontSize="8"
                fontWeight="bold"
              >
                Round 2390
              </text>
            </svg>

            {/* X-axis labels */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-between px-4">
              <span className="text-xs text-gray-400">Round 2378</span>
              <span className="text-xs text-gray-400">Round 2384</span>
              <span className="text-xs text-gray-400">Round 2390</span>
              <span className="text-xs text-gray-400">Round 2396</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around px-6 py-6">
        <button
          onClick={handleStakeClick}
          className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
        >
          <ChartSpline size={16} color="#C7EF6B" />
          <span className="text-gray-300 text-xs">Stake</span>
        </button>

        <button
          onClick={handleUnstakeClick}
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
            Unstake
          </span>
        </button>

        <button
          onClick={handleWithdrawClick}
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
          onClick={handleShareClick}
          className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
        >
          <Share size={20} color="#C7EF6B" />
          <span className="text-gray-300 text-xs">Share</span>
        </button>
      </div>

      {/* About Section */}
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
            {currentValidator?.description || "Livepeer transcoder"}
          </p>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Status</span>
              <span
                className={`font-medium ${currentValidator?.active ? "text-green-400" : "text-red-400"}`}
              >
                {currentValidator?.active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Performance</span>
              <span className="text-gray-300 font-medium">
                {currentValidator?.performance || "Unknown"}
              </span>
            </div> */}

            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Fee</span>
              <span className="text-gray-300 font-medium">
                {currentValidator?.reward
                  ? (parseFloat(currentValidator.reward) / 10000).toFixed(1) +
                    "%"
                  : "0%"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">APY</span>
              <span className="text-[#C7EF6B] font-medium">
                {currentValidator?.apy || "0%"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Staked</span>
              <span className="text-[#C7EF6B] font-medium">
                {hasStakeWithValidator
                  ? `${Math.round(parseFloat(userDelegation?.bondedAmount || "0")).toLocaleString()} LPT`
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
                      {withdrawableLocks
                        .reduce(
                          (total, lock) => total + parseFloat(lock.amount),
                          0
                        )
                        .toFixed(2)}{" "}
                      LPT
                    </div>
                  )}
                  {hasPendingUnbonding && (
                    <div className="text-yellow-400 font-medium text-sm">
                      {pendingUnbondingLocks
                        .reduce(
                          (total, lock) => total + parseFloat(lock.amount),
                          0
                        )
                        .toFixed(2)}{" "}
                      LPT
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400 text-sm">Total Stake</span>
              <span className="text-gray-300 font-medium">
                {currentValidator
                  ? parseFloat(currentValidator.totalStake).toFixed(0)
                  : "0"}{" "}
                LPT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Validator Guide"
        content={[
          "Review this validator's performance, APY, total stake, and fees before staking.",
          "APY shows your potential earnings, total stake shows community trust, and fees show the validator's charge.",
          "Click 'Stake' to start earning or 'Unstake' to remove your current stake.",
        ]}
      />

      {/* Share Drawer */}
      <ShareDrawer
        isOpen={showShareDrawer}
        onClose={() => setShowShareDrawer(false)}
        validatorName={currentValidator?.ensName || "Unknown Validator"}
        validatorId={validatorId || ""}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/validator" />
    </div>
  );
};
