import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useLeaderboard } from "@/contexts/LeaderboardContext";
import { Skeleton } from "@/components/ui/skeleton";

export const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    entries,
    selectedPeriod,
    setPeriod,
    isLoading: loading,
    error,
  } = useLeaderboard();


  const handleBackClick = () => {
    navigate(-1);
  };

  const handlePeriodChange = (period: string) => {
    setPeriod(period as any);
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
            <option value="Daily" className="bg-[#1a1a1a]">
              Daily
            </option>
            <option value="Weekly" className="bg-[#1a1a1a]">
              Weekly
            </option>
            <option value="Monthly" className="bg-[#1a1a1a]">
              Monthly
            </option>
          </select>
          <ChevronDown
            size={16}
            color="#C7EF6B"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none"
          />
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Loading / Error States */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`lb-skel-${index}`} className="bg-[#1a1a1a] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-full bg-[#2a2a2a]" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-[#2a2a2a]" />
                      <Skeleton className="h-3 w-20 bg-[#2a2a2a]" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-24 bg-[#2a2a2a] ml-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {error && !loading && (
          <div className="text-center text-sm text-red-400">{error}</div>
        )}

        {/* Leaderboard Entries */}
        {!loading && !error && (
          <div className="space-y-3">
            {entries.map((entry) => {
              const earned = Number.parseFloat(entry.lifetimeReward || "0");
              const displayEarned = Number.isFinite(earned)
                ? earned.toLocaleString(undefined, { maximumFractionDigits: 6 })
                : "0";
              const shortAddress =
                entry.address.length > 10
                  ? `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`
                  : entry.address;
              return (
                <div
                  key={`${entry.address}-${entry.rank}`}
                  className="bg-[#1a1a1a] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm">
                          #{entry.rank}
                        </span>
                      </div>
                      <div>
                        <p className="text-[#86B3F7] font-medium">
                          {shortAddress} ⭐
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#C7EF6B] text-xs">
                        {displayEarned} LPT
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};
