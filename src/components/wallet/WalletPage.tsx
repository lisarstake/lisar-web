import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OrchestratorItem } from "./OrchestratorItem";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { delegationService } from "@/services";
import { OrchestratorResponse } from "@/services/delegation/types";
import {
  ChartSpline,
  Plus,
  Send,
  History,
  Search,
  ChartPie,
  Bell,
} from "lucide-react";

export const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [orchestrators, setOrchestrators] = useState<OrchestratorResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock wallet data for now
  const walletData = {
    balance: 5000,
    currency: 'LPT',
    fiatValue: '$100,000',
    fiatCurrency: 'USD'
  };

  // Fetch orchestrators on component mount
  useEffect(() => {
    const fetchOrchestrators = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await delegationService.getOrchestrators();
        
        if (response.success) {
          setOrchestrators(response.data);
        } else {
          setError(response.message || 'Failed to fetch orchestrators');
        }
      } catch (err) {
        setError('An error occurred while fetching orchestrators');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrchestrators();
  }, []);

  const filteredOrchestrators = orchestrators.filter((orch) =>
    orch.ensName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStakeClick = () => {
    navigate("/validator");
  };

  const handleHistoryClick = () => {
    navigate("/history");
  };

  const handleDepositClick = () => {
    // Navigate directly to stake page with payment options (using default validator)
    navigate("/stake/giga-kubica-eth?deposit=true");
  };

  const handlePortfolioClick = () => {
    // Navigate to portfolio page
    navigate("/portfolio");
  };

  const handleProfileClick = () => {
    // Navigate to profile page
    navigate("/profile");
  };

  const handleNotificationsClick = () => {
    // Navigate to notifications page
    navigate("/notifications");
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleProfileClick}
            className="w-10 h-10 bg-[#86B3F7] rounded-full flex items-center justify-center hover:bg-[#96C3F7] transition-colors cursor-pointer"
          >
            <span className="text-black font-bold text-sm">H</span>
          </button>
          <div className="flex flex-col gap-1">
            <span className="text-gray-300 text-xs font-normal ">
              @Hezekiah
            </span>
            <span className="text-gray-100 text-sm font-medium">
              Welcome back!
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNotificationsClick}
            className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#3a3a3a] transition-colors cursor-pointer"
          >
            <Bell size={20} color="#86B3F7" />
          </button>
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="text-center px-6 py-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-white/70 text-sm">Wallet balance</span>
        </div>
        <h1 className="text-4xl font-semibold text-gray-300 mb-2">
          {walletData.balance.toLocaleString()} {walletData.currency}
        </h1>
        <p className="text-white/70 text-lg">≈{walletData.fiatValue}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around px-6 py-6">
        <button
          onClick={handleDepositClick}
          className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
        >
          <Send size={16} color="#C7EF6B" />
          <span className="text-gray-300 text-xs">Deposit</span>
        </button>

        <button
          onClick={handleStakeClick}
          className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
        >
          <ChartSpline size={16} color="#C7EF6B" />
          <span className="text-gray-300 text-xs">Stake</span>
        </button>

        <button
          onClick={handlePortfolioClick}
          className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
        >
          <ChartPie size={16} color="#C7EF6B" />
          <span className="text-gray-300 text-xs">Portfolio</span>
        </button>

        <button
          onClick={handleHistoryClick}
          className="flex flex-col items-center justify-center space-y-2 w-20 h-20 bg-[#2a2a2a] rounded-xl"
        >
          <History size={16} color="#C7EF6B" />
          <span className="text-gray-300 text-xs">History</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} color="#636363" />
          </div>
          <input
            type="text"
            placeholder="Search orchestrator"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-sm rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#C7EF6B]"
          />
        </div>
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
            {filteredOrchestrators.map((orchestrator) => (
              <OrchestratorItem
                key={orchestrator.address}
                orchestrator={orchestrator}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
