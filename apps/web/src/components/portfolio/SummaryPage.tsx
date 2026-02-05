import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  CircleQuestionMark,
} from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { useDelegation } from "@/contexts/DelegationContext";
import { useWallet } from "@/contexts/WalletContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useStablesApy } from "@/hooks/useStablesApy";
import { formatEarnings, formatLifetime, formatStables } from "@/lib/formatters";
import { getEarliestUnbondingTime } from "@/lib/unbondingTime";
import { IdleBalanceCard } from "./IdleBalanceCard";

export const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const walletType =
    (location.state as { walletType?: string })?.walletType || "staking";
  const isSavings = walletType === "savings";

  const { delegatorStakeProfile, delegatorTransactions } = useDelegation();
  const { stablesBalance, highyieldBalance } = useWallet();
  const { summary, setMode } = usePortfolio();
  const { perena: perenaApy, isLoading: apyLoading } = useStablesApy();

  // Set portfolio mode based on wallet type
  React.useEffect(() => {
    setMode(isSavings ? "savings" : "staking");
  }, [isSavings, setMode]);

  
  const lifetimeRewards = useMemo(() => {
    return summary?.lifetimeRewards || 0;
  }, [summary]);

  const lifetimeUnbonded = useMemo(() => {
    return summary?.lifetimeUnbonded || 0;
  }, [summary]);

  // Current balance/stake from summary
  const currentBalance = useMemo(() => {
    return summary?.currentStake || 0;
  }, [summary]);

  const currentStake = useMemo(() => {
    return summary?.currentStake || 0;
  }, [summary]);

  // Total balance 
  const totalBalance = useMemo(() => {
    if (isSavings) return stablesBalance ?? 0;
    const unstaked = highyieldBalance ?? 0;
    const staked = parseFloat(delegatorStakeProfile?.currentStake || "0") || 0;
    return unstaked + staked;
  }, [isSavings, stablesBalance, highyieldBalance, delegatorStakeProfile?.currentStake]);

  // Idle balance = total - active stake
  const idleBalance = useMemo(() => {
    return Math.max(0, totalBalance - (summary?.currentStake ?? 0));
  }, [totalBalance, summary?.currentStake]);

  // Calculate pending unbonding data
  const pendingUnbondingData = useMemo(() => {
    if (!delegatorTransactions) {
      return {
        count: 0,
        totalAmount: 0,
        timeRemaining: null,
      };
    }

    const pending = delegatorTransactions.pendingStakeTransactions || [];
    const count = pending.length;
    const totalAmount = pending.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || "0"),
      0
    );
    const timeRemaining = getEarliestUnbondingTime(pending);

    return {
      count,
      totalAmount,
      timeRemaining,
    };
  }, [delegatorTransactions]);

  // Calculate completed unbonding (ready for withdrawal)
  const completedUnbondingData = useMemo(() => {
    if (!delegatorTransactions) {
      return {
        count: 0,
        totalAmount: 0,
        validatorId: null,
      };
    }

    const completed = delegatorTransactions.completedStakeTransactions || [];
    const count = completed.length;
    const totalAmount = completed.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || "0"),
      0
    );
    // Find the first completed transaction with a valid delegate
    const firstValidTransaction = completed.find(
      (tx) => tx?.delegate?.id
    );
    const validatorId = firstValidTransaction?.delegate?.id || null;

    return {
      count,
      totalAmount,
      validatorId,
    };
  }, [delegatorTransactions]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleWithdrawClick = () => {
    if (completedUnbondingData.validatorId) {
      navigate(`/validator-details/${completedUnbondingData.validatorId}`);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between py-8 mb-2">
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center"
          >
            <ChevronLeft color={isSavings ? "#86B3F7" : "#C7EF6B"} />
          </button>
          <h1 className="text-lg font-medium text-white">Summary</h1>
          <button
            onClick={() => setShowHelpDrawer(true)}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#86B3F7" size={16} />
          </button>
        </div>

        {isSavings ? (
          /* Stables Summary Layout */
          <>
            {/* Active Vest - Stables */}
            <div className="bg-[#6da7fd] rounded-2xl p-5 mb-4 border border-[#86B3F7]/30">
              <p className="text-white/90 text-sm font-medium uppercase tracking-wider mb-1">
                Active vest
              </p>
              <p className="text-white/70 text-xs mb-2">
                Your balance currently earning interest
              </p>
              <p className="text-white text-xl font-bold">
                {formatStables(currentBalance)}{" "}
                <span className="text-lg font-semibold">USD</span>
              </p>
            </div>

            {/* Idle Balance - Stables */}
            <IdleBalanceCard
              balance={idleBalance}
              tokenSymbol="USD"
              isSavings={true}
            />

            {/* Stats Grid - Stables */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-[#2a2a2a]">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">
                  Rewards earned
                </p>
                <p className="text-[#86B3F7] text-xl font-semibold">
                  {lifetimeRewards.toFixed(4)}{" "}
                  <span className="text-sm font-normal text-white/70">USD</span>
                </p>
              </div>
            </div>

            {/* Info Card - Stables */}
            <div className="bg-[#0f0f0f] rounded-lg p-3 border border-[#2a2a2a]">
              <p className="text-gray-400 text-xs leading-relaxed">
                Your stables earn daily interest at up to{" "}
                <span className="text-white/90 font-medium">
                  {apyLoading && perenaApy === null
                    ? "..."
                    : perenaApy
                      ? `${(perenaApy * 100).toFixed(1)}%`
                      : "14%"}
                </span>{" "}
                APY.
              </p>
            </div>
          </>
        ) : (
          /* High Yield Summary Layout */
          <>
            {/* Active Vest - Growth */}
            <div className="bg-linear-to-br from-[#0f0f0f] to-[#1a1a1a] rounded-2xl p-6 mb-4 border border-[#C7EF6B]/30">
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">
                Active vest
              </p>
              <p className="text-white/70 text-xs mb-2">
                Your balance currently earning interest
              </p>
              <p className="text-white text-xl font-bold">
                {formatEarnings(currentStake)}{" "}
                <span className="text-lg font-semibold">LPT</span>
              </p>
            </div>

            {/* Idle Balance - Growth */}
            <IdleBalanceCard
              balance={idleBalance}
              tokenSymbol="LPT"
              isSavings={false}
            />

            {/* Stats Grid - High Yield */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-[#2a2a2a]">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">
                  Rewards earned
                </p>
                <p className="text-[#C7EF6B] text-xl font-semibold">
                  {formatLifetime(lifetimeRewards)}{" "}
                  <span className="text-sm font-normal text-white/70">LPT</span>
                </p>
              </div>
            </div>
          </>
        )}

        {/* Withdrawal Available Section - Only for High Yield */}
        {!isSavings && completedUnbondingData.count > 0 && (
          <div className="bg-[#0f0f0f] rounded-2xl p-5 mb-4 border border-[#C7EF6B]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#C7EF6B]/15 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} color="#C7EF6B" />
              </div>
              <div>
                <p className="text-white font-medium">Ready to withdraw</p>
                <p className="text-gray-500 text-xs">
                  Your unbonding period is complete
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#050505] rounded-xl py-3 px-4">
                <span className="text-gray-400 text-sm">Amount</span>
                <span className="text-white font-semibold">
                  {formatEarnings(completedUnbondingData.totalAmount)} LPT
                </span>
              </div>
              <button
                onClick={handleWithdrawClick}
                className="w-full py-3.5 rounded-xl font-semibold bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
              >
                Withdraw now
              </button>
            </div>
          </div>
        )}

        {/* Unbonding in Progress Section - Only for High Yield */}
        {!isSavings && pendingUnbondingData.count > 0 && (
          <div className="bg-[#0f0f0f] rounded-2xl p-5 mb-4 border border-[#2a2a2a]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                <Clock size={20} color="#f59e0b" />
              </div>
              <div>
                <p className="text-white font-medium">Unbonding in progress</p>
                <p className="text-gray-500 text-xs">
                  Funds will be available soon
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#050505] rounded-xl py-3 px-4">
                <span className="text-gray-400 text-sm">Amount</span>
                <span className="text-white font-semibold">
                  {formatEarnings(pendingUnbondingData.totalAmount)} LPT
                </span>
              </div>
              {pendingUnbondingData.timeRemaining && (
                <div className="flex items-center justify-between bg-[#050505] rounded-xl py-3 px-4">
                  <span className="text-gray-400 text-sm">Time remaining</span>
                  <span className="text-amber-400 font-semibold text-sm">
                    {pendingUnbondingData.timeRemaining}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info message if no pending actions - Only for High Yield */}
        {!isSavings &&
          completedUnbondingData.count === 0 &&
          pendingUnbondingData.count === 0 && (
            <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-5 border border-[#2a2a2a] text-center">
              <p className="text-gray-400 text-sm">
                No pending withdrawals at this time
              </p>
            </div>
          )}
      </div>

      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title={isSavings ? "Stables Summary" : "High Yield Summary"}
        content={
          isSavings
            ? [
              "View your stables portfolio performance.",
              "Total Rewards displays your lifetime earnings from stable savings.",
              "Withdrawals are instant with no waiting periods.",
            ]
            : [
              "Lifetime Rewards shows your total earnings from staking since you started.",
              "Lifetime Withdrawn displays the total amount you've withdrawn from your portfolio.",
              "Withdrawal in Progress indicates funds currently in the unbonding period.",
            ]
        }
      />

      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};
