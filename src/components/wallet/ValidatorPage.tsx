import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrchestratorItem } from "./OrchestratorItem";
import { orchestrators } from "@/data/orchestrators";
import { FilterType } from "@/types/wallet";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

export const ValidatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>("apy");
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const handleBackClick = () => {
    navigate("/wallet");
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const sortedOrchestrators = [...orchestrators].sort((a, b) => {
    switch (activeFilter) {
      case "apy":
        return b.apy - a.apy;
      case "total-stake":
        return b.totalStaked - a.totalStaked;
      case "active-time":
        // For demo purposes, we'll use a simple sort by name
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>

        <h1 className="text-lg font-medium text-white">Stake</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Filter Tabs - Separated */}
      <div className="flex items-center justify-start px-6 pb-4 space-x-2">
        <button
          onClick={() => setActiveFilter("apy")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "apy"
              ? "bg-[#C7EF6B] text-black"
              : "bg-[#1a1a1a] text-white hover:text-[#C7EF6B]"
          }`}
        >
          APY
        </button>
        <button
          onClick={() => setActiveFilter("total-stake")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "total-stake"
              ? "bg-[#C7EF6B] text-black"
              : "bg-[#1a1a1a] text-white hover:text-[#C7EF6B]"
          }`}
        >
          Total stake
        </button>
        <button
          onClick={() => setActiveFilter("active-time")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "active-time"
              ? "bg-[#C7EF6B] text-black"
              : "bg-[#1a1a1a] text-white hover:text-[#C7EF6B]"
          }`}
        >
          Active time
        </button>
      </div>

      {/* Orchestrator List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide">
        <div className="space-y-3">
          {sortedOrchestrators.map((orchestrator) => (
            <OrchestratorItem
              key={orchestrator.id}
              orchestrator={orchestrator}
            />
          ))}
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Validator Guide"
        content={[
          "Choose a validator to stake with based on APY, total stake, and active time.",
          "Higher APY means more rewards. More total stake means more community trust.",
          "Use filter buttons to sort validators and click any validator to see details."
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/validator" />
    </div>
  );
};
