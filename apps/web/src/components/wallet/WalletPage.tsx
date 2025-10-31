import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { OrchestratorList } from "./OrchestratorList";
import { WalletActionButtons } from "./WalletActionButtons";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { Search, Bell } from "lucide-react";

export const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { orchestrators, isLoading, error, refetch } = useOrchestrators();
  const { state } = useAuth();
  const { wallet, isLoading: walletLoading } = useWallet();

  // Filter by search query, and limit to 25 if no search query
  const filteredOrchestrators = useMemo(() => {
    const filtered = orchestrators.filter((orch) =>
      orch.ensName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Show top 25 with lowest rewards if no search, otherwise show all matches
    return searchQuery ? filtered : filtered.slice(0, 25);
  }, [orchestrators, searchQuery]);

  const handleStakeClick = () => {
    navigate("/validator");
  };

  const handleHistoryClick = () => {
    navigate("/history");
  };

  const handleDepositClick = () => {
    const defaultValidator = orchestrators[0];
    if (defaultValidator) {
      navigate(`/stake/${defaultValidator.address}?deposit=true`);
    }
  };

  const handlePortfolioClick = () => {
    navigate("/portfolio");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleNotificationsClick = () => {
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
                {state.user?.full_name?.charAt(0) ||
                  state.user?.email?.charAt(0) ||
                  "U"}
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
        {walletLoading ? (
          <div className="space-y-2">
            <div className="h-12 bg-[#2a2a2a] rounded-lg animate-pulse w-38 mx-auto"></div>
            <div className="h-6 bg-[#2a2a2a] rounded-lg animate-pulse w-28 mx-auto"></div>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-semibold text-gray-300 mb-2">
              {wallet?.balanceLpt.toLocaleString() || 0} LPT
            </h1>
            <p className="text-white/70 text-lg">
              ≈{wallet?.fiatSymbol}
              {(wallet ? wallet.fiatValue : 0).toLocaleString()}
            </p>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <WalletActionButtons
        onDepositClick={handleDepositClick}
        onStakeClick={handleStakeClick}
        onPortfolioClick={handlePortfolioClick}
        onHistoryClick={handleHistoryClick}
      />

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
