import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrchestratorList } from "./OrchestratorList";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";
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
  const { orchestrators, isLoading, error, refetch } = useOrchestrators();
  const { state } = useAuth();

  // Mock wallet data for now
  const walletData = {
    balance: 5000,
    currency: 'LPT',
    fiatValue: '$100,000',
    fiatCurrency: 'USD'
  };


  // Ensure orchestrators is always an array
  const safeOrchestrators = Array.isArray(orchestrators) ? orchestrators : [];
  
  // Filter out crypto addresses (0x...) and keep only proper ENS names
  const validOrchestrators = safeOrchestrators.filter((orch) => {
    const ensName = orch.ensName || '';
    // Keep only ENS names that don't start with '0x' and have proper format
    return !ensName.startsWith('0x') && ensName.includes('.') && ensName.length > 0;
  });
  
  // Sort by total stake (descending) and take top 30
  const topOrchestrators = validOrchestrators
    .sort((a, b) => parseFloat(b.totalStake) - parseFloat(a.totalStake))
    .slice(0, 30);
  
  // Filter by search query
  const filteredOrchestrators = topOrchestrators.filter((orch) =>
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

  const handleRetry = () => {
    refetch();
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
            {state.user?.img ? (
              <img
                src={state.user.img}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-black font-bold text-sm">
                {state.user?.full_name?.charAt(0) || state.user?.email?.charAt(0) || "U"}
              </span>
            )}
          </button>
          <div className="flex flex-col gap-1">
            <span className="text-gray-300 text-sm font-normal">
              @{state.user?.email?.split("@")[0] || "User"}
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
      <div className="text-center px-6 py-4">
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
      <div className="px-6 pt-2 pb-4">
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
        <OrchestratorList
          orchestrators={filteredOrchestrators}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
          skeletonCount={5}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
