import React, { useState } from "react";
import { ChevronDown, ChevronLeft, CircleQuestionMark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HelpDrawer } from "../general/HelpDrawer";
import { Skeleton } from "@/components/ui/skeleton";

export const PortfolioSkeleton: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between py-8 mb-6 px-6">
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

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4 mb-6 px-6">
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
          <Skeleton className="h-4 w-20 mb-2 bg-[#2a2a2a]" />
          <Skeleton className="h-8 w-24 bg-[#2a2a2a]" />
        </div>
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
          <Skeleton className="h-4 w-16 mb-2 bg-[#2a2a2a]" />
          <Skeleton className="h-8 w-20 bg-[#2a2a2a]" />
        </div>
      </div>

      {/* Next Payout Section Skeleton */}
      <div className="flex space-x-2 mb-6 px-6">
        <div
          className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] flex-1"
          style={{ flex: "4" }}
        >
          <Skeleton className="h-4 w-24 mb-3 bg-[#2a2a2a]" />
          <div className="flex items-center space-x-3">
            <Skeleton className="flex-1 h-3 rounded-full bg-[#2a2a2a]" />
            <Skeleton className="h-4 w-12 bg-[#2a2a2a]" />
          </div>
        </div>
        <div
          className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] flex items-center justify-center"
          style={{ flex: "1" }}
        >
          <div className="text-center">
            <Skeleton className="w-8 h-8 rounded mb-2 bg-[#2a2a2a]" />
            <Skeleton className="h-3 w-16 bg-[#2a2a2a]" />
          </div>
        </div>
      </div>

      {/* Analytics Header Skeleton */}
      <div className="flex items-center justify-between mb-5 px-6">
        <span className="text-base font-medium text-white/50">
          View summary
        </span>
        <button
          className="relative flex items-center justify-center p-1 rounded hover:bg-[#232323] transition-colors"
          type="button"
        >
          <ChevronDown size={16} color="gray" />
        </button>
      </div>

      {/* Current Stake Section - Always visible */}
      <div className="mb-6 px-6">
        <h2 className="text-white text-lg font-medium mb-4">Current Stake</h2>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full bg-[#2a2a2a]" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-[#2a2a2a]" />
                    <Skeleton className="h-3 w-20 bg-[#2a2a2a]" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16 bg-[#2a2a2a] ml-auto" />
                  <Skeleton className="h-3 w-12 bg-[#2a2a2a] ml-auto" />
                </div>
              </div>
            </div>
          ))}
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
        ]}
      />
    </div>
  );
};
