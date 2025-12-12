import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, TrendingUp, TrendingDown, Clock, CheckCircle, CircleQuestionMark } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { useDelegation } from "@/contexts/DelegationContext";
import { formatEarnings, formatLifetime } from "@/lib/formatters";
import { getEarliestUnbondingTime } from "@/lib/unbondingTime";

export const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const walletType = (location.state as { walletType?: string })?.walletType || "staking";
  const isSavings = walletType === "savings";

  const {
    delegatorStakeProfile,
    delegatorTransactions,
  } = useDelegation();

  // Get lifetime data
  const lifetimeRewards = delegatorStakeProfile
    ? parseFloat(delegatorStakeProfile.lifetimeRewards) || 0
    : 0;

  const lifetimeUnbonded = delegatorStakeProfile
    ? parseFloat(delegatorStakeProfile.lifetimeUnbonded) || 0
    : 0;

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
    const validatorId = completed.length > 0 ? completed[0].delegate.id : null;

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
            <ChevronLeft color="#C7EF6B" />
          </button>
          <h1 className="text-lg font-medium text-white">Summary</h1>
          <button
            onClick={() => setShowHelpDrawer(true)}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#86B3F7" size={16} />
          </button>
        </div>

        {/* Lifetime Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Lifetime Rewards */}
          <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-4 border border-[#2a2a2a]">
           
            <p className="text-gray-400 text-sm mb-2">
              Total Rewards
            </p>
            <p className={`text-xl font-semibold ${isSavings ? "text-[#86B3F7]" : "text-[#C7EF6B]"}`}>
              {formatLifetime(lifetimeRewards)}
              <span className="text-sm ml-1">{isSavings ? "USDC" : "LPT"}</span>
            </p>
          </div>

          {/* Lifetime Withdrawn */}
          <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-4 border border-[#2a2a2a]">
           
            <p className="text-gray-400 text-sm mb-2">
              Total Withdrawn
            </p>
            <p className="text-[#FF6B6B] text-xl font-semibold">
              {formatLifetime(lifetimeUnbonded)}
              <span className="text-sm ml-1">{isSavings ? "USDC" : "LPT"}</span>
            </p>
          </div>
        </div>

        {/* Withdrawal Available Section - Only for High Yield */}
        {!isSavings && completedUnbondingData.count > 0 && (
          <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-5 mb-4 border border-[#C7EF6B]/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#C7EF6B]/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} color="#C7EF6B" />
              </div>
              <div>
                <p className="text-gray-100 text-sm font-medium">
                  Withdrawal Available
                </p>
                <p className="text-gray-400 text-xs">Ready to withdraw</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#0f0f0f] rounded-lg p-3">
                <span className="text-gray-400 text-sm">Amount</span>
                <span className="text-white font-bold text-lg">
                  {formatEarnings(completedUnbondingData.totalAmount)} {isSavings ? "USDC" : "LPT"}
                </span>
              </div>
              <button
                onClick={handleWithdrawClick}
                className="w-full py-3 rounded-lg font-semibold bg-[#C7EF6B] text-black hover:bg-[#B8E55A] transition-colors"
              >
                Withdraw Now
              </button>
            </div>
          </div>
        )}

        {/* Unbonding in Progress Section - Only for High Yield */}
        {!isSavings && pendingUnbondingData.count > 0 && (
          <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-5 mb-4 border border-[#2a2a2a]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock size={20} color="#fbbf24" />
              </div>
              <div>
                <p className="text-gray-100 text-sm font-medium">
                  Withdrawal in Progress
                </p>
                <p className="text-gray-400 text-xs">Queued</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#0f0f0f] rounded-lg p-3">
                <span className="text-gray-400 text-sm">Amount</span>
                <span className="text-white font-bold text-lg">
                  {formatEarnings(pendingUnbondingData.totalAmount)} {isSavings ? "USDC" : "LPT"}
                </span>
              </div>
              {pendingUnbondingData.timeRemaining && (
                <div className="flex items-center justify-between bg-[#0f0f0f] rounded-lg p-3">
                  <span className="text-gray-400 text-sm">Time remaining</span>
                  <span className="text-yellow-400 text-sm font-semibold">
                    {pendingUnbondingData.timeRemaining}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info message if no pending actions - Only for High Yield */}
        {!isSavings && completedUnbondingData.count === 0 && pendingUnbondingData.count === 0 && (
          <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-5 border border-[#2a2a2a] text-center">
            <p className="text-gray-400 text-sm">
              No pending or available withdrawals at this time
            </p>
          </div>
        )}
      </div>

      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Portfolio Summary"
        content={[
          "View your complete portfolio performance and earnings history.",
          "Lifetime Rewards shows your total earnings from staking since you started.",
          "Lifetime Withdrawn displays the total amount you've withdrawn from your portfolio.",
          "Withdrawal Available shows funds ready to be withdrawn immediately.",
          "Withdrawal in Progress indicates funds currently in the unbonding period.",
        ]}
      />

      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};

