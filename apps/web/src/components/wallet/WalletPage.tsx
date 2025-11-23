import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OrchestratorList } from "../validator/OrchestratorList";
import { WalletActionButtons } from "./WalletActionButtons";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useNotification } from "@/contexts/NotificationContext";
import { priceService } from "@/lib/priceService";
import { formatEarnings } from "@/lib/formatters";
import { Search, Bell, CircleQuestionMark } from "lucide-react";

export const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showBalanceDrawer, setShowBalanceDrawer] = useState(false);
  const { orchestrators, isLoading, error, refetch } = useOrchestrators();
  const { state } = useAuth();
  const { wallet, isLoading: walletLoading } = useWallet();
  const { delegatorStakeProfile, isLoading: delegationLoading } =
    useDelegation();
  const { unreadCount } = useNotification();

  const filteredOrchestrators = useMemo(() => {
    if (!searchQuery.trim()) {
      return orchestrators;
    }

    const query = searchQuery.toLowerCase().trim();

    return orchestrators.filter((orchestrator) => {
      // Search by ENS name
      const ensName =
        orchestrator.ensIdentity?.name || orchestrator.ensName || "";
      if (ensName.toLowerCase().includes(query)) {
        return true;
      }

      // Search by address
      const address = orchestrator.address || "";
      if (address.toLowerCase().includes(query)) {
        return true;
      }

      // Search by description
      const description =
        orchestrator.ensIdentity?.description || orchestrator.description || "";
      if (description.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });
  }, [orchestrators, searchQuery]);

  const [fiatValue, setFiatValue] = useState(0);
  const [walletFiatValue, setWalletFiatValue] = useState(0);
  const [stakedFiatValue, setStakedFiatValue] = useState(0);

  // Calculate combined balance (wallet + staked)
  const combinedBalance = useMemo(() => {
    const walletBalance = wallet?.balanceLpt || 0;
    const stakedBalance = delegatorStakeProfile
      ? parseFloat(delegatorStakeProfile.currentStake) || 0
      : 0;
    return walletBalance + stakedBalance;
  }, [wallet?.balanceLpt, delegatorStakeProfile]);

  const fiatSymbol = useMemo(() => {
    const fiatCurrency = wallet?.fiatCurrency || state.user?.fiat_type || "USD";
    return priceService.getCurrencySymbol(fiatCurrency);
  }, [wallet?.fiatCurrency, state.user?.fiat_type]);

  const walletBalance = useMemo(
    () => wallet?.balanceLpt || 0,
    [wallet?.balanceLpt]
  );
  const stakedBalance = useMemo(() => {
    return delegatorStakeProfile
      ? parseFloat(delegatorStakeProfile.currentStake) || 0
      : 0;
  }, [delegatorStakeProfile]);

  useEffect(() => {
    const calculateFiatValues = async () => {
      const fiatCurrency =
        wallet?.fiatCurrency || state.user?.fiat_type || "USD";

      const [combinedFiat, walletFiat, stakedFiat] = await Promise.all([
        priceService.convertLptToFiat(combinedBalance, fiatCurrency),
        priceService.convertLptToFiat(walletBalance, fiatCurrency),
        priceService.convertLptToFiat(stakedBalance, fiatCurrency),
      ]);

      setFiatValue(combinedFiat);
      setWalletFiatValue(walletFiat);
      setStakedFiatValue(stakedFiat);
    };

    calculateFiatValues();
  }, [
    combinedBalance,
    walletBalance,
    stakedBalance,
    wallet?.fiatCurrency,
    state.user?.fiat_type,
  ]);

  const handleStakeClick = () => {
    navigate("/validator");
  };

  const handleHistoryClick = () => {
    navigate("/history");
  };

  const handleDepositClick = () => {
    const defaultValidator = orchestrators[0];
    if (defaultValidator) {
      navigate(`/deposit`);
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
        <div className="flex items-center space-x-2.5">
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
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-100 text-sm font-medium">
              Hi, {state.user?.full_name?.split(" ")[0] || "User"}!
            </span>
            <span className="text-gray-300 text-xs font-normal">
              {state.user?.email
                ? state.user.email.length > 20
                  ? state.user.email.slice(0, 20) + "..."
                  : state.user.email
                : "User"}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNotificationsClick}
            className="relative w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#3a3a3a] transition-colors cursor-pointer"
          >
            <Bell size={16} color="#86B3F7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="text-center px-6 py-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-white/70 text-sm">Total balance</span>
          <button
            onClick={() => setShowBalanceDrawer(true)}
            className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
          >
            <CircleQuestionMark size={16} color="#636363" />
          </button>
        </div>
        {walletLoading || delegationLoading || !wallet ? (
          <div className="space-y-2">
            <div className="h-12 bg-[#2a2a2a] rounded-lg animate-pulse w-38 mx-auto"></div>
            <div className="h-6 bg-[#2a2a2a] rounded-lg animate-pulse w-28 mx-auto"></div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-semibold text-gray-300 mb-2">
              {formatEarnings(combinedBalance)}
              <span className="text-sm ml-0.5">LPT</span>
            </h1>
            <p className="text-white/70 text-base">
              ≈{fiatSymbol}
              {fiatValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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

      {/* Balance Information Drawer */}
      <HelpDrawer
        isOpen={showBalanceDrawer}
        onClose={() => setShowBalanceDrawer(false)}
        title="Balance Information"
        content={[
          `Your total balance is a combination of your unstaked balance and staked balance.`,
          `Unstaked Balance: ${formatEarnings(walletBalance)} LPT (≈${fiatSymbol}${walletFiatValue.toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )})`,
          `Staked Balance: ${formatEarnings(stakedBalance)} LPT (≈${fiatSymbol}${stakedFiatValue.toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )})`,
          `Total Balance: ${formatEarnings(combinedBalance)} LPT (≈${fiatSymbol}${fiatValue.toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )})`,
        ]}
      />
    </div>
  );
};
