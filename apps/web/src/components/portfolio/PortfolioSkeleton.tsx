import React, { useState } from "react";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HelpDrawer } from "../general/HelpDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNavigation } from "@/components/general/BottomNavigation";

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
    <div className="h-screen bg-[#181818] text-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between py-8 mb-2">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>
          <h1 className="text-lg font-medium text-white">My portfolio</h1>
        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
         <CircleQuestionMark color="#9ca3af" size={16} />
        </button>
      </div>

        {/* Main Wallet Card Skeleton */}
        <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-2xl p-6 h-[170px] mb-6 relative overflow-hidden border border-[#2a2a2a]">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7EF6B]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#86B3F7]/5 rounded-full blur-2xl"></div>

          {/* Circular Progress Skeleton - Top Right */}
          <div className="absolute top-4 right-4 z-20">
            <Skeleton className="w-12 h-12 rounded-full bg-[#2a2a2a]" />
        </div>

          {/* Content Skeleton */}
          <div className="relative z-10">
            {/* Title and Eye Icon */}
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-32 bg-[#2a2a2a]" />
              <Skeleton className="w-4 h-4 rounded bg-[#2a2a2a]" />
        </div>

            {/* Main Balance Skeleton */}
            <div className="mb-8">
              <Skeleton className="h-8 w-40 bg-[#2a2a2a]" />
      </div>

            {/* Three Values Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-col">
                <Skeleton className="h-5 w-16 mb-1 bg-[#2a2a2a]" />
                <Skeleton className="h-3 w-12 bg-[#2a2a2a]" />
              </div>
              <div className="flex items-center flex-col">
                <Skeleton className="h-5 w-12 mb-1 bg-[#2a2a2a]" />
                <Skeleton className="h-3 w-8 bg-[#2a2a2a]" />
              </div>
              <div className="flex items-center flex-col">
                <Skeleton className="h-5 w-16 mb-1 bg-[#2a2a2a]" />
                <Skeleton className="h-3 w-20 bg-[#2a2a2a]" />
              </div>
            </div>
          </div>
        </div>

        {/* Two Cards Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Summary Card Skeleton */}
          <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-2xl p-5 border border-[#2a2a2a] relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 relative z-10">
                <Skeleton className="h-5 w-20 mb-2 bg-[#2a2a2a]" />
                <Skeleton className="h-4 w-full bg-[#2a2a2a]" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-full bg-[#2a2a2a]" />
          </div>

          {/* My Positions Card Skeleton */}
          <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-2xl p-5 border border-[#2a2a2a] relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 relative z-10">
                <Skeleton className="h-5 w-24 mb-2 bg-[#2a2a2a]" />
                <Skeleton className="h-4 w-full bg-[#2a2a2a]" />
          </div>
            </div>
            <Skeleton className="h-8 w-20 rounded-full bg-[#2a2a2a]" />
        </div>
      </div>

        {/* Recent Transactions Section Skeleton */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-2">
            <Skeleton className="h-4 w-32 bg-[#2a2a2a]" />
            <Skeleton className="h-4 w-16 bg-[#2a2a2a]" />
      </div>

          {/* Transaction Items Skeleton */}
        <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
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

      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};
