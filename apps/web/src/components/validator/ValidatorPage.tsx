import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { OrchestratorList } from "../validator/OrchestratorList";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { FilterType } from "@/types/wallet";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

export const ValidatorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const { orchestrators, isLoading, error, refetch } = useOrchestrators();

  // Get tier name from location state, default to "Stake" if not provided
  const tierName =
    (location.state as { tierName?: string })?.tierName || "Stake";

  const urlFilter = useMemo((): FilterType => {
    const filterParam = searchParams.get("filter");
    if (
      filterParam &&
      ["apy", "total-stake", "active-time"].includes(filterParam)
    ) {
      return filterParam as FilterType;
    }
    return "apy";
  }, [searchParams]);

  const [activeFilter, setActiveFilter] = useState<FilterType>(urlFilter);

  useEffect(() => {
    setActiveFilter(urlFilter);
  }, [urlFilter]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setSearchParams({ filter }, { replace: true });
  };

  const sortedOrchestrators = useMemo(() => {
    const sorted = [...orchestrators].sort((a, b) => {
      switch (activeFilter) {
        case "apy":
          return parseFloat(b.apy) - parseFloat(a.apy);
        case "total-stake":
          return parseFloat(b.totalStake) - parseFloat(a.totalStake);
        case "active-time":
          return parseInt(b.activeSince) - parseInt(a.activeSince);
        default:
          return 0;
      }
    });
    return sorted;
  }, [orchestrators, activeFilter]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleRetry = () => {
    refetch();
  };

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

        <h1 className="text-lg font-medium text-white">{tierName}</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Filter Tabs - Separated */}
      {/* <div className="flex items-center justify-start px-6 pb-4 space-x-2">
        <button
          onClick={() => handleFilterChange("apy")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "apy"
              ? "bg-[#C7EF6B] text-black"
              : "bg-[#1a1a1a] text-white hover:text-[#C7EF6B]"
          }`}
        >
          APY
        </button>
        <button
          onClick={() => handleFilterChange("total-stake")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "total-stake"
              ? "bg-[#C7EF6B] text-black"
              : "bg-[#1a1a1a] text-white hover:text-[#C7EF6B]"
          }`}
        >
          Total stake
        </button>
        <button
          onClick={() => handleFilterChange("active-time")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeFilter === "active-time"
              ? "bg-[#C7EF6B] text-black"
              : "bg-[#1a1a1a] text-white hover:text-[#C7EF6B]"
          }`}
        >
          Active time
        </button>
      </div> */}

      {/* Orchestrator List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide">
        <OrchestratorList
          orchestrators={sortedOrchestrators}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
          skeletonCount={5}
        />
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Validator Guide"
        content={[
          "Choose a validator to stake with based on APY, total stake, and active time.",
          "Higher APY means more rewards. More total stake means more community trust.",
          "Use filter buttons to sort validators and click any validator to see details.",
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/validator" />
    </div>
  );
};
