import React, { useState, useMemo, useEffect, useRef } from "react";
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
import QRCode from "qrcode";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { EmptyState } from "@/components/general/EmptyState";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useAuth } from "@/contexts/AuthContext";
import { PortfolioSkeleton } from "./PortfolioSkeleton";
import { formatEarnings, formatLifetime } from "@/lib/formatters";
import { getColorForAddress } from "@/lib/qrcode";

interface StakeEntryItemProps {
  entry: StakeEntry;
  onClick: () => void;
}

const StakeEntryItem: React.FC<StakeEntryItemProps> = ({ entry, onClick }) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [avatarError, setAvatarError] = useState(false);

  const avatar =
    entry.orchestrator?.avatar || entry.orchestrator?.ensIdentity?.avatar;

  useEffect(() => {
    if (!entry.id || !qrCanvasRef.current) return;

    if (avatar && !avatarError) return;

    const qrColor = getColorForAddress(entry.id);

    QRCode.toCanvas(
      qrCanvasRef.current,
      entry.id,
      {
        width: 40,
        margin: 1,
        color: {
          dark: qrColor,
          light: "#1a1a1a",
        },
      },
      (error) => {
        if (error) console.error("QR Code generation error:", error);
      }
    );
  }, [entry.id, avatar, avatarError]);

  return (
    <div
      className="bg-[#1a1a1a] rounded-xl p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {avatar && !avatarError ? (
            <img
              src={avatar}
              alt={entry.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={() => {
                setAvatarError(true);
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
              <canvas
                ref={qrCanvasRef}
                className="w-full h-full rounded-full"
              />
            </div>
          )}
          <div>
            <p className="text-gray-100 font-medium">
              {entry.name.length > 20
                ? `${entry.name.substring(0, 16)}..`
                : entry.name}
            </p>
            <p className="text-gray-400 text-xs">
              Staked: {formatEarnings(entry.yourStake)} LPT
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[#C7EF6B] font-medium text-sm">
            APY: {entry.apy * 100}%
          </p>
          <p className="text-gray-400 text-xs">Fee: {entry.fee.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};

interface StakeEntry {
  id: string;
  name: string;
  yourStake: number;
  apy: number;
  fee: number;
  orchestrator?: any;
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
    // Initialize defaults
    let totalStake = 0;
    let currentStake = 0;
    let lifetimeRewards = 0;
    let lifetimeUnbonded = 0;
    let dailyEarnings = 0;
    let weeklyEarnings = 0;
    let monthlyEarnings = 0;
    const stakeEntries: StakeEntry[] = [];

    // Handle delegatorStakeProfile data (if available)
    if (delegatorStakeProfile) {
      totalStake = parseFloat(delegatorStakeProfile.currentStake) || 0;
      currentStake = totalStake;
      lifetimeRewards = parseFloat(delegatorStakeProfile.lifetimeRewards) || 0;
      lifetimeUnbonded =
        parseFloat(delegatorStakeProfile.lifetimeUnbonded) || 0;
    }

    // Handle userDelegation and orchestrators data (if available)
    if (userDelegation) {
      const bondedAmount = parseFloat(userDelegation.bondedAmount) || 0;
      const delegateId = userDelegation.delegate?.id || "";

      // Find orchestrator if orchestrators list is available
      const orchestrator =
        orchestrators.length > 0
          ? orchestrators.find((orch) => orch.address === delegateId)
          : null;

      const orchestratorName =
        orchestrator?.ensIdentity?.name ||
        orchestrator?.ensName ||
        userDelegation.delegate?.id ||
        "Unknown Orchestrator";

      // Handle APY as string (e.g., "15%") or number (e.g., 15)
      let apyPercentage = 0;
      if (orchestrator?.apy) {
        const apyValue = orchestrator.apy;
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

      // Calculate earnings if we have bonded amount and APY
      if (bondedAmount > 0 && apyPercentage > 0) {
        const grossDailyEarnings = (bondedAmount * apyPercentage) / (100 * 365);
        const grossWeeklyEarnings = grossDailyEarnings * 7;
        const grossMonthlyEarnings = grossDailyEarnings * 30;

        dailyEarnings = grossDailyEarnings * (1 - rewardCutDecimal);
        weeklyEarnings = grossWeeklyEarnings * (1 - rewardCutDecimal);
        monthlyEarnings = grossMonthlyEarnings * (1 - rewardCutDecimal);
      }

      // Add stake entry if we have delegation data
      if (delegateId) {
        stakeEntries.push({
          id: delegateId,
          name: orchestratorName,
          yourStake: bondedAmount,
          apy: apyPercentage / 100,
          fee: rewardCutPercentage,
          orchestrator: orchestrator || null,
        });
      }
    }

    return {
      totalStake,
      currentStake,
      lifetimeRewards,
      lifetimeUnbonded,
      dailyEarnings,
      weeklyEarnings,
      monthlyEarnings,
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
              {formatEarnings(totalStake)}
              <span className="text-sm ml-0.5">LPT</span>
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
              <span className="inline-flex items-baseline gap-0.5">
                {selectedPeriod === "Weekly"
                  ? formatEarnings(weeklyEarnings)
                  : selectedPeriod === "Monthly"
                  ? formatEarnings(monthlyEarnings)
                  : formatEarnings(monthlyEarnings * 12)}
                <span className="text-sm ml-0.1">LPT</span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          <div
            className="bg-[#1a1a1a] rounded-xl p-4 flex-1"
            style={{ flex: "4" }}
          >
            <p className="text-gray-400 text-sm font-medium mb-3 flex gap-1 items-center">
              <span>
                <CircleDollarSign size={16} />
              </span>
              Next payout in{" "}
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
                  <span className="inline-flex items-baseline gap-0.5">
                    {formatLifetime(lifetimeRewards)}
                    <span className="text-sm ml-0.1">LPT</span>
                  </span>
                </p>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-4">
                <p className="text-gray-400 text-sm font-medium mb-2">
                  Lifetime Withdrawn
                </p>
                <p className="text-[#FF6B6B] text-xl font-semibold">
                  <span className="inline-flex items-baseline gap-0.5">
                    {formatLifetime(lifetimeUnbonded)}
                    <span className="text-sm ml-0.1">LPT</span>
                  </span>
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
                <StakeEntryItem
                  key={entry.id}
                  entry={entry}
                  onClick={() => handleStakeClick(entry.id)}
                />
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
