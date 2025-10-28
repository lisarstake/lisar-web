import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Trophy, ChevronDown, CircleQuestionMark } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";

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
  const { userDelegation, orchestrators } = useOrchestrators();
  const { state } = useAuth();

  const formatEarnings = (value: number): string => {
    if (value >= 100000) {
      return `${Math.round(value / 1000)}k`;
    } else if (value >= 10000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toLocaleString();
  };

  const portfolioData = useMemo(() => {
    if (!userDelegation || !orchestrators.length) {
      return {
        totalStake: 0,
        currentStake: 0,
        dailyEarnings: 0,
        weeklyEarnings: 0,
        monthlyEarnings: 0,
        stakeEntries: []
      };
    }

    const bondedAmount = parseFloat(userDelegation.bondedAmount);
    const delegateId = userDelegation.delegate.id;
    const orchestrator = orchestrators.find(orch => orch.address === delegateId);
    const orchestratorName = orchestrator?.ensName || 'Unknown Orchestrator';
    const apyString = orchestrator?.apy || '0%';
    const apyPercentage = parseFloat(apyString.replace('%', ''));
    const rewardCutPercentage = orchestrator?.reward ? parseFloat(orchestrator.reward) / 10000 : 0;
    const rewardCutDecimal = rewardCutPercentage / 100;

    const grossDailyEarnings = (bondedAmount * apyPercentage) / (100 * 365);
    const grossWeeklyEarnings = grossDailyEarnings * 7;
    const grossMonthlyEarnings = grossDailyEarnings * 30;
    
    const dailyEarnings = grossDailyEarnings * (1 - rewardCutDecimal);
    const weeklyEarnings = grossWeeklyEarnings * (1 - rewardCutDecimal);
    const monthlyEarnings = grossMonthlyEarnings * (1 - rewardCutDecimal);

    const stakeEntries: StakeEntry[] = [{
      id: delegateId,
      name: orchestratorName,
      yourStake: Math.round(bondedAmount),
      apy: apyPercentage / 100,
      fee: rewardCutPercentage
    }];

    return {
      totalStake: Math.round(bondedAmount),
      currentStake: Math.round(bondedAmount),
      dailyEarnings: Math.round(dailyEarnings),
      weeklyEarnings: Math.round(weeklyEarnings),
      monthlyEarnings: Math.round(monthlyEarnings),
      stakeEntries
    };
  }, [userDelegation, orchestrators]);

  const { totalStake, currentStake, dailyEarnings, weeklyEarnings, monthlyEarnings, stakeEntries } = portfolioData;


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
            <p className="text-black text-2xl font-semibold">{formatEarnings(totalStake)} LPT</p>
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
                    <option value="Weekly" className="bg-[#1a1a1a]">Weekly</option>
                    <option value="Monthly" className="bg-[#1a1a1a]">Monthly</option>
                    <option value="Yearly" className="bg-[#1a1a1a]">Yearly</option>
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
                : formatEarnings(monthlyEarnings * 12)
              } LPT
            </p>
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          <div className="bg-[#1a1a1a] rounded-xl p-4 flex-1" style={{ flex: '4' }}>
            <p className="text-gray-400 text-sm font-medium mb-3">Next payout in</p>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-[#2a2a2a] rounded-full h-3">
                <div className="bg-[#C7EF6B] h-3 rounded-full relative" style={{ width: '85%' }}>
                  <div className="bg-white w-4 h-4 rounded-full absolute -top-0.5 right-0 transform translate-x-1/2"></div>
                </div>
              </div>
              <span className="text-white text-sm font-medium">22 hrs</span>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-[#2a2a2a] transition-colors" style={{ flex: '1' }} onClick={handleTrophyClick}>
            <div className="text-center">
              <div className="text-2xl mb-1">🏆</div>
              <p className="text-white text-xs font-medium">Leaderboard</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-white text-lg font-medium mb-4">Current Stake</h2>
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
                      <p className="text-gray-100 font-medium">{entry.name}</p>
                      <p className="text-gray-400 text-xs">Your Stake: {entry.yourStake} LPT</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#C7EF6B] font-medium text-sm">APY: {Math.round(entry.apy * 100)}%</p>
                    <p className="text-gray-400 text-xs">Fee: {entry.fee.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          "Click any validator in Current Stake to view details or manage your position."
        ]}
      />

      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};
