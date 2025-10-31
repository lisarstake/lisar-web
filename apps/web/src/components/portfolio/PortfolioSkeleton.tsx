import React, { useState } from "react";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HelpDrawer } from "../general/HelpDrawer";

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
        <div className="bg-gray-700 rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-20 mb-2"></div>
          <div className="h-8 bg-gray-600 rounded w-24"></div>
        </div>
        <div className="bg-gray-700 rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-16 mb-2"></div>
          <div className="h-8 bg-gray-600 rounded w-20"></div>
        </div>
      </div>

      {/* Next Payout Section Skeleton */}
      <div className="flex space-x-2 mb-6 px-6">
        <div
          className="bg-gray-700 rounded-xl p-4 flex-1 animate-pulse"
          style={{ flex: "4" }}
        >
          <div className="h-4 bg-gray-600 rounded w-24 mb-3"></div>
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-gray-600 rounded-full h-3"></div>
            <div className="h-4 bg-gray-600 rounded w-12"></div>
          </div>
        </div>
        <div
          className="bg-gray-700 rounded-xl p-4 flex items-center justify-center animate-pulse"
          style={{ flex: "1" }}
        >
          <div className="text-center">
            <div className="w-8 h-8 bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-16"></div>
          </div>
        </div>
      </div>

      {/* Analytics Header Skeleton */}
      <div className="flex items-center justify-between mb-5 px-6">
        <div className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Current Stake Section - Always visible */}
      <div className="mb-6 px-6">
        <h2 className="text-white text-lg font-medium mb-4">Current Stake</h2>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-xl p-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-600 rounded w-24"></div>
                    <div className="h-3 bg-gray-600 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-600 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-600 rounded w-12"></div>
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
