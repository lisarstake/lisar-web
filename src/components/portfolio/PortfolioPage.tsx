import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Trophy, ChevronDown, CircleQuestionMark } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { orchestrators } from "@/data/orchestrators";

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

  const stakeEntries: StakeEntry[] = [
    {
      id: "2",
      name: "streamplace.eth",
      yourStake: 2508,
      apy: 65.6,
      fee: 0
    },
    {
      id: "4",
      name: "day-dreamer.eth",
      yourStake: 1200,
      apy: 58.2,
      fee: 0
    },
    {
      id: "3",
      name: "everest-node.eth",
      yourStake: 800,
      apy: 72.1,
      fee: 0
    },
    {
      id: "5",
      name: "interptr.eth",
      yourStake: 600,
      apy: 61.8,
      fee: 0
    },
    {
      id: "6",
      name: "tor-node.eth",
      yourStake: 1000,
      apy: 69.3,
      fee: 0
    },
    {
      id: "7",
      name: "pepenode.eth",
      yourStake: 750,
      apy: 63.7,
      fee: 0
    }
  ];

  const totalStake = stakeEntries.reduce((sum, entry) => sum + entry.yourStake, 0);
  const weeklyEarnings = totalStake * 0.01; // Mock calculation

  const handleBackClick = () => {
    navigate("/wallet");
  };

  const handleTrophyClick = () => {
    navigate("/leaderboard");
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const handleStakeClick = (stakeId: string) => {
    // Find the orchestrator by ID and use its slug
    const orchestrator = orchestrators.find(o => o.id === stakeId);
    if (orchestrator) {
      navigate(`/validator-details/${orchestrator.slug}`);
    }
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header - Now scrollable */}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Total Stake Card */}
          <div className="bg-[#C7EF6B] rounded-xl p-4">
            <p className="text-black text-sm font-medium my-1">Total stake</p>
            <p className="text-black text-2xl font-semibold">{totalStake.toLocaleString()} LPT</p>
          </div>

          {/* Weekly Earnings Card */}
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
            <p className="text-white text-2xl font-semibold">{weeklyEarnings.toLocaleString()} LPT</p>
          </div>
        </div>

        {/* Next Payout and Leaderboard */}
        <div className="flex space-x-2 mb-6">
          {/* Next Payout - 3/4 width */}
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

          {/* Leaderboard - 1/4 width */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-center cursor-pointer hover:bg-[#2a2a2a] transition-colors" style={{ flex: '1' }} onClick={handleTrophyClick}>
            <div className="text-center">
              <div className="text-2xl mb-1">🏆</div>
              <p className="text-white text-xs font-medium">Leaderboard</p>
            </div>
          </div>
        </div>

        {/* Current Stake */}
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
                    <img 
                      src={orchestrators.find(o => o.id === entry.id)?.icon || '/o1.png'} 
                      alt={entry.name} 
                      className="w-10 h-10 rounded-full object-cover" 
                    />
                    <div>
                      <p className="text-gray-100 font-medium">{entry.name}</p>
                      <p className="text-gray-400 text-xs">Your Stake: {entry.yourStake} LPT</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#C7EF6B] font-medium text-sm">APY: {entry.apy}%</p>
                    <p className="text-gray-400 text-xs">Fee: {entry.fee}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help Drawer */}
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

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};
