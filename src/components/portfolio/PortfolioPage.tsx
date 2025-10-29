import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Trophy,
  ChevronDown,
  CircleQuestionMark,
  ChevronUp,
  Info,
  CircleDollarSign,
} from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { EmptyState } from "@/components/general/EmptyState";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useAuth } from "@/contexts/AuthContext";
import { PortfolioSkeleton } from "./PortfolioSkeleton";

interface StakeEntry {
  id: string;
  name: string;
  yourStake: number;
  apy: number;
  fee: number;
}

export const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("Weekly");
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const { orchestrators } = useOrchestrators();
  const { userDelegation, delegatorStakeProfile, protocolStatus, isLoading } =
    useDelegation();
  const { state } = useAuth();

  const formatEarnings = (value: number): string => {
    if (value >= 100000) {
      return `${Math.round(value / 1000)}k`;
    } else if (value >= 10000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toLocaleString();
  };

  const formatLifetime = (value: number): string => {
    if (value >= 100000) {
      return `${(value / 1000).toFixed(2)}k`;
    } else if (value >= 10000) {
      return `${(value / 1000).toFixed(2)}k`;
    }
    return value.toLocaleString();
  };

  // Calculate next payout progress using protocol status
  const nextPayoutProgress = useMemo(() => {
    if (!protocolStatus) return { progress: 85, timeRemaining: "22 hrs" };

    const { roundLength, blocksIntoRound, blocksRemaining } = protocolStatus;
    const progress =
      roundLength > 0 ? (blocksIntoRound / roundLength) * 100 : 85;
    const timeRemaining = protocolStatus.estimatedHoursHuman || "22 hrs";

    return { progress: Math.min(progress, 100), timeRemaining };
  }, [protocolStatus]);

  const portfolioData = useMemo(() => {
    if (!userDelegation || !orchestrators.length || !delegatorStakeProfile) {
      return {
        totalStake: 0,
        currentStake: 0,
        lifetimeRewards: 0,
        lifetimeUnbonded: 0,
        dailyEarnings: 0,
        weeklyEarnings: 0,
        monthlyEarnings: 0,
        stakeEntries: [],
      };
    }

    // Use currentStake from stake profile
    const currentStakeValue = parseFloat(delegatorStakeProfile.currentStake);
    const lifetimeRewardsValue = parseFloat(
      delegatorStakeProfile.lifetimeRewards
    );
    const lifetimeUnbondedValue = parseFloat(
      delegatorStakeProfile.lifetimeUnbonded
    );

    const bondedAmount = parseFloat(userDelegation.bondedAmount);
    const delegateId = userDelegation.delegate.id;
    const orchestrator = orchestrators.find(
      (orch) => orch.address === delegateId
    );
    const orchestratorName = orchestrator?.ensName || "Unknown Orchestrator";
    const apyValue = orchestrator?.apy;
    // Handle APY as string (e.g., "15%") or number (e.g., 15)
    let apyPercentage = 0;
    if (apyValue) {
      if (typeof apyValue === "string") {
        apyPercentage = parseFloat(apyValue.replace("%", "")) || 0;
      } else {
        apyPercentage = typeof apyValue === "number" ? apyValue : 0;
      }
    }
    const rewardCutPercentage = orchestrator?.reward
      ? parseFloat(orchestrator.reward) / 10000
      : 0;
    const rewardCutDecimal = rewardCutPercentage / 100;

    const grossDailyEarnings = (bondedAmount * apyPercentage) / (100 * 365);
    const grossWeeklyEarnings = grossDailyEarnings * 7;
    const grossMonthlyEarnings = grossDailyEarnings * 30;

    const dailyEarnings = grossDailyEarnings * (1 - rewardCutDecimal);
    const weeklyEarnings = grossWeeklyEarnings * (1 - rewardCutDecimal);
    const monthlyEarnings = grossMonthlyEarnings * (1 - rewardCutDecimal);

    const stakeEntries: StakeEntry[] = [
      {
        id: delegateId,
        name: orchestratorName,
        yourStake: Math.round(bondedAmount),
        apy: apyPercentage / 100,
        fee: rewardCutPercentage,
      },
    ];

    return {
      totalStake: Math.round(currentStakeValue),
      currentStake: Math.round(currentStakeValue),
      lifetimeRewards: Math.round(lifetimeRewardsValue),
      lifetimeUnbonded: Math.round(lifetimeUnbondedValue),
      dailyEarnings: Math.round(dailyEarnings),
      weeklyEarnings: Math.round(weeklyEarnings),
      monthlyEarnings: Math.round(monthlyEarnings),
      stakeEntries,
    };
  }, [userDelegation, orchestrators, delegatorStakeProfile]);

  const {
    totalStake,
    lifetimeRewards,
    lifetimeUnbonded,
    weeklyEarnings,
    monthlyEarnings,
    stakeEntries,
  } = portfolioData;

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleTrophyClick = () => {
    navigate("/leaderboard");
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const handleStakeClick = (stakeId: string) => {
    navigate(`/validator-details/${stakeId}`);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  if (isLoading) {
    return <PortfolioSkeleton />;
  }

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        <div className="flex items-center justify-between py-8 mb-6">
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center"
          >
            <ChevronLeft color="#C7EF6B" />
          </button>
          <h1 className="text-lg font-medium text-white">Portfolio</h1>
          <button
            onClick={handleHelpClick}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#86B3F7" size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#C7EF6B] rounded-xl p-4">
            <p className="text-black text-sm font-medium my-1">Total stake</p>
            <p className="text-black text-2xl font-semibold">
              {formatEarnings(totalStake)} LPT
            </p>
          </div>

          <div className="bg-blue-500 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white text-sm font-medium">Earnings</p>
              <div className="relative">
                <div className="inline-flex items-center border-b border-white cursor-pointer mb-1">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="bg-transparent text-white text-sm appearance-none focus:outline-none cursor-pointer border-none px-0"
                    style={{ boxShadow: "none" }}
                  >
                    <option value="Weekly" className="bg-[#1a1a1a]">
                      Weekly
                    </option>
                    <option value="Monthly" className="bg-[#1a1a1a]">
                      Monthly
                    </option>
                    <option value="Yearly" className="bg-[#1a1a1a]">
                      Yearly
                    </option>
                  </select>
                  <ChevronDown
                    size={12}
                    color="white"
                    className="pointer-events-none"
                  />
                </div>
              </div>
            </div>
            <p className="text-white text-2xl font-semibold">
              {selectedPeriod === "Weekly"
                ? formatEarnings(weeklyEarnings)
                : selectedPeriod === "Monthly"
                  ? formatEarnings(monthlyEarnings)
                  : formatEarnings(monthlyEarnings * 12)}{" "}
              LPT
            </p>
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          <div
            className="bg-[#1a1a1a] rounded-xl p-4 flex-1"
            style={{ flex: "4" }}
          >
            <p className="text-gray-400 text-sm font-medium mb-3 flex gap-1 items-center">
              Next payout in{" "}
              <span>
                <CircleDollarSign size={16} />
              </span>
            </p>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-[#2a2a2a] rounded-full h-3">
                <div
                  className="bg-[#C7EF6B] h-3 rounded-full relative"
                  style={{ width: `${nextPayoutProgress.progress}%` }}
                >
                  <div className="bg-white w-4 h-4 rounded-full absolute -top-0.5 right-0 transform translate-x-1/2"></div>
                </div>
              </div>
              <span className="text-white text-sm font-medium">
                {nextPayoutProgress.timeRemaining}
              </span>
            </div>
          </div>

          <div
            className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-[#2a2a2a] transition-colors"
            style={{ flex: "1" }}
            onClick={handleTrophyClick}
          >
            <div className="text-center">
              <div className="text-xl mb-1">🏆</div>
              <p className="text-white text-xs font-medium">Leaderboard</p>
            </div>
          </div>
        </div>

        {/* Analytics Header */}
        <div
          className={`flex items-center justify-between ${isAnalyticsOpen ? "mb-3" : "mb-5"}`}
        >
          <span className="text-base font-medium text-white/50">
            View summary
          </span>
          <button
            onClick={() => setIsAnalyticsOpen((v) => !v)}
            className="relative flex items-center justify-center p-1 rounded hover:bg-[#232323] transition-colors"
            aria-label={isAnalyticsOpen ? "Collapse summary" : "Expand summary"}
            type="button"
          >
            {isAnalyticsOpen ? (
              <ChevronUp size={16} color="gray" />
            ) : (
              <ChevronDown size={16} color="gray" />
            )}
          </button>
        </div>

        {/* Collapsible Analytics Section */}
        {isAnalyticsOpen && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#1a1a1a] rounded-xl p-4">
                <p className="text-gray-400 text-sm font-medium mb-2">
                  Lifetime Rewards
                </p>
                <p className="text-[#C7EF6B] text-xl font-semibold">
                  {formatLifetime(lifetimeRewards)} LPT
                </p>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-4">
                <p className="text-gray-400 text-sm font-medium mb-2">
                  Lifetime Withdrawn
                </p>
                <p className="text-[#FF6B6B] text-xl font-semibold">
                  {formatLifetime(lifetimeUnbonded)} LPT
                </p>
              </div>
            </div>
          </>
        )}

        <div className="mb-6">
          <h2 className="text-white text-lg font-medium mb-4">Current Stake</h2>
          {stakeEntries.length === 0 ? (
            <EmptyState
              icon={Info}
              iconColor="#86B3F7"
              iconBgColor="#2a2a2a"
              title="No stakes yet"
              description="You haven't staked with any validators yet."
            />
          ) : (
            <div className="space-y-3">
              {stakeEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-[#1a1a1a] rounded-xl p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                  onClick={() => handleStakeClick(entry.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                        <span className="text-[#C7EF6B] font-bold text-sm">
                          {entry.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-100 font-medium">
                          {entry.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Staked: {entry.yourStake} LPT
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#C7EF6B] font-medium text-sm">
                        APY: {Math.round(entry.apy * 100)}%
                      </p>
                      <p className="text-gray-400 text-xs">
                        Fee: {entry.fee.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Portfolio Guide"
        content={[
          "View your total stake, earnings, and current staking positions in one place.",
          "Total stake shows your combined investment across all validators.",
          "Earnings can be viewed weekly, monthly, or yearly. Next payout shows when you'll receive rewards.",
          "Click any validator in Current Stake to view details or manage your position.",
        ]}
      />

      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};
