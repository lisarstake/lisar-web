import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";

interface LeaderboardEntry {
  id: string;
  address: string;
  totalEarned: number;
  rank: number;
}

export const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("Weekly");

  const leaderboardEntries: LeaderboardEntry[] = [
    {
      id: "1",
      address: "0x6f71...a980",
      totalEarned: 5023,
      rank: 1
    },
    {
      id: "2",
      address: "0x6f71...a980",
      totalEarned: 5001,
      rank: 2
    },
    {
      id: "3",
      address: "0x6f71...a980",
      totalEarned: 4686,
      rank: 3
    },
    {
      id: "4",
      address: "0x6f71...a980",
      totalEarned: 3400,
      rank: 4
    },
    {
      id: "5",
      address: "0x6f71...a980",
      totalEarned: 3201,
      rank: 5
    },
    {
      id: "6",
      address: "0x6f71...a980",
      totalEarned: 2985,
      rank: 6
    }
  ];

  const handleBackClick = () => {
    navigate("/portfolio");
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

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

        <h1 className="text-lg font-medium text-white">Top Earners</h1>

        <div className="relative inline-flex items-center border-b border-[#C7EF6B] pb-0.5">
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="bg-transparent text-white text-xs appearance-none pr-4 focus:outline-none cursor-pointer"
            style={{ boxShadow: "none" }}
          >
            <option value="Weekly" className="bg-[#1a1a1a]">Weekly</option>
            <option value="Monthly" className="bg-[#1a1a1a]">Monthly</option>
            <option value="Yearly" className="bg-[#1a1a1a]">Yearly</option>
          </select>
          <ChevronDown size={16} color="#C7EF6B" className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Leaderboard Entries */}
        <div className="space-y-3">
          {leaderboardEntries.map((entry) => (
            <div key={entry.id} className="bg-[#1a1a1a] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">#{entry.rank}</span>
                  </div>
                  <div>
                    <p className="text-[#86B3F7] font-medium">{entry.address} ⭐</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#C7EF6B] text-xs">{entry.totalEarned.toLocaleString()} USDC</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};
