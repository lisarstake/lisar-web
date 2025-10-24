import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OrchestratorItem } from "./OrchestratorItem";
import { delegationService } from "@/services";
import { OrchestratorResponse } from "@/services/delegation/types";
import { FilterType } from "@/types/wallet";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

export const ValidatorPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>("apy");
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [orchestrators, setOrchestrators] = useState<OrchestratorResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orchestrators on component mount
  useEffect(() => {
    const fetchOrchestrators = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await delegationService.getOrchestrators(); // Fetch all orchestrators

        console.log(response, error);

        if (response.success) {
          setOrchestrators(response.data);
        } else {
          setError(response.message || "Failed to fetch orchestrators");
        }
      } catch (err) {
        setError("An error occurred while fetching orchestrators");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrchestrators();
  }, []);

  const handleBackClick = () => {
    navigate("/wallet");
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const sortedOrchestrators = [...orchestrators].sort((a, b) => {
    switch (activeFilter) {
      case "apy":
        return parseFloat(b.apy) - parseFloat(a.apy);
      case "total-stake":
        return parseFloat(b.totalStake) - parseFloat(a.totalStake);
      case "active-time":
        // For demo purposes, we'll use a simple sort by name
        return a.ensName.localeCompare(b.ensName);
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C7EF6B]"></div>
            <span className="ml-3 text-gray-400">Loading validators...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-400 text-center mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#C7EF6B] text-black rounded-lg font-medium hover:bg-[#B8E55A] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedOrchestrators.map((orchestrator, index) => (
              <OrchestratorItem
                key={orchestrator.address}
                orchestrator={orchestrator}
              />
            ))}
          </div>
        )}
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
