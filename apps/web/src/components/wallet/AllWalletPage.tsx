import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { PortfolioSelectionDrawer } from "@/components/general/PortfolioSelectionDrawer";
import { AllBalancesDrawer } from "@/components/general/AllBalancesDrawer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useCampaign } from "@/contexts/CampaignContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useGuidedTour } from "@/hooks/useGuidedTour";
import { usePrices } from "@/hooks/usePrices";
import { ALL_WALLET_TOUR_ID } from "@/lib/tourConfig";
import { priceService } from "@/lib/priceService";
import {
  Bell,
  Plus,
  Eye,
  EyeOff,
  X,
  ArrowDown,
  ArrowRight,
  CircleDollarSign,
  ChevronRight,
} from "lucide-react";
import { LisarLines } from "@/components/landing/lisar-lines";

const ADD_CASH_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];
const NAIRA_OPTION_ENABLED = false;

export const AllWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAllBalancesDrawer, setShowAllBalancesDrawer] = useState(false);
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState(false);
  const [transferDrawer, setTransferDrawer] = useState<
    "deposit" | "withdraw" | null
  >(null);
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("wallet_show_balance");
    return saved ? JSON.parse(saved) : false;
  });
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "NGN">("USD");

  const {
    activeSystemNotifications,
    dismissSystemNotification: handleDismissNotification,
  } = useNotification();

  useEffect(() => {
    localStorage.setItem("wallet_show_balance", JSON.stringify(showBalance));
  }, [showBalance]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("open") !== "deposit") return;
    setTransferDrawer("deposit");
    navigate("/wallet", { replace: true });
  }, [location.search, navigate]);

  const { orchestrators } = useOrchestrators();
  const { state } = useAuth();
  const {
    wallet,
    isLoading: walletLoading,
    highyieldBalance: contextHighyieldBalance,
    solanaUsdcBalance,
    solanaUsdtBalance,
    nairaBalance,
    stablesLoading,
    highyieldLoading,
  } = useWallet();
  const { delegatorStakeProfile, isLoading: delegationLoading } =
    useDelegation();
  const { campaignStatus } = useCampaign();
  const { unreadCount } = useNotification();
  const { prices } = usePrices();

  // Start tour for non-onboarded users
  // const shouldAutoStart = true
  const shouldAutoStart = useMemo(() => {
    return state.user?.is_onboarded === false && !state.isLoading;
  }, [state.user?.is_onboarded, state.isLoading]);

  const { } = useGuidedTour({
    tourId: ALL_WALLET_TOUR_ID,
    autoStart: shouldAutoStart,
  });

  const highyieldBalance = contextHighyieldBalance || 0;
  const solUsdcBalance = solanaUsdcBalance || 0;
  const solUsdtBalance = solanaUsdtBalance || 0;
  const totalIdleUsdBalance = useMemo(() => {
    const lptPriceInUsd = prices.lpt || 0;
    const unstakedLpt = highyieldBalance;
    const lptUsdValue = unstakedLpt * lptPriceInUsd;
    const idleUsdValue = solUsdcBalance + solUsdtBalance;
    return lptUsdValue + idleUsdValue;
  }, [highyieldBalance, solUsdcBalance, solUsdtBalance, prices]);

  const fiatSymbol = displayCurrency === "NGN" ? "₦" : "$";

  const handleNotificationClick = () => {
    navigate("/notifications");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleDepositClick = (walletType?: string) => {
    if (walletType === "main") {
      navigate("/wallet?open=deposit");
      return;
    }
    if (walletType) {
      navigate(`/wallet/${walletType}`);
    } else {
      navigate("/wallet?open=deposit");
    }
  };

  const displayBalance = useMemo(() => {
    const ngnRate = prices.ngn || 0;
    const safeNairaBalance = nairaBalance || 0;

    if (displayCurrency === "NGN") {
      return totalIdleUsdBalance * ngnRate + safeNairaBalance;
    }

    const nairaInUsd = ngnRate > 0 ? safeNairaBalance / ngnRate : 0;
    return totalIdleUsdBalance + nairaInUsd;
  }, [displayCurrency, totalIdleUsdBalance, prices.ngn, nairaBalance]);

  const walletCards = useMemo(
    () => [
      {
        id: "main",
        title: "Total Balance",
        balance: displayBalance,
        currencySymbol: fiatSymbol,
        type: "main",
        gradient: "from-[#0f0f0f] to-[#151515]",
      },
    ],
    [displayBalance, fiatSymbol],
  );

  const renderLoadingStars = (sizeClass: string) => (
    <div className={`flex items-baseline justify-center gap-1 ${sizeClass}`}>
      {Array.from({ length: 4 }).map((_, index) => (
        <span
          key={`wallet-star-${index}`}
          className="inline-block text-white animate-[wallet-star-float_900ms_ease-in-out_infinite]"
          style={{ animationDelay: `${index * 120}ms` }}
        >
          ★
        </span>
      ))}
    </div>
  );

  const closeTransferDrawer = () => setTransferDrawer(null);

  const handleTransferOptionSelect = (asset: "naira" | "crypto") => {
    if (!transferDrawer) return;
    const mode = transferDrawer;
    closeTransferDrawer();
    navigate(`/wallet/${mode}/${asset}`);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#050505] shrink-0">
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleProfileClick}
              data-tour="all-wallet-profile-icon"
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
              <span className="text-gray-100 text-xs">Welcome 👋</span>
              <span className="text-gray-100 text-sm font-medium lowercase">
                {state.user?.full_name?.split(" ")[0] || "User"}!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors cursor-pointer"
            >
              {showBalance ? (
                <Eye size={22} color="#fff" />
              ) : (
                <EyeOff size={22} color="#fff" />
              )}
            </button>
            <button
              onClick={handleNotificationClick}
              data-tour="all-wallet-notification-icon"
              className="relative w-9 h-9 rounded-full flex items-center justify-center bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors cursor-pointer"
            >
              <Bell size={22} color="#fff" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain pb-20">
        <>
          {/* Total Balance Card */}
          <div className="px-6 pb-6">
            <div>
              {walletCards.map((card) => (
                <div key={card.id}>
                  <div
                    onClick={() => {
                      if (card.type !== "main") {
                        handleDepositClick(card.type);
                      }
                    }}
                    className={`bg-linear-to-br ${card.gradient} rounded-2xl py-5 min-h-[100px] relative overflow-hidden border border-[#2a2a2a] ${card.type !== "main"
                        ? "cursor-pointer hover:opacity-95 transition-opacity"
                        : ""
                      }`}
                    data-tour={
                      card.id === "main" ? "all-wallet-balance-card" : undefined
                    }
                  >
                    {/* Lisar Lines Decoration */}
                    <LisarLines
                      position="top-right"
                      className="opacity-100"
                      width="185px"
                      height="185px"
                    />

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7EF6B]/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#86B3F7]/5 rounded-full blur-2xl"></div>

                    {/* Wallet Title */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <h3 className="text-white/70 text-sm">{card.title}</h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowBalance(!showBalance);
                          }}
                          className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                        >
                          {showBalance ? (
                            <Eye size={16} color="rgba(255, 255, 255, 0.6)" />
                          ) : (
                            <EyeOff size={16} color="rgba(255, 255, 255, 0.6)" />
                          )}
                        </button>
                      </div>

                      {/* Balance Display */}
                      <div>
                        {walletLoading ||
                          delegationLoading ||
                          stablesLoading ||
                          highyieldLoading ? (
                          <div className="flex items-baseline justify-center gap-2 mb-1">
                            <span className="text-2xl font-bold text-white">
                              ••••
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline justify-center gap-2 mb-1">
                            <span className="text-xl font-bold text-white/90">
                              {showBalance
                                ? `${card.currencySymbol}${card.balance.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                                : "••••"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* View Portfolio */}
                      <div className="flex items-center justify-center mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPortfolioDrawer(true);
                          }}
                          className="flex items-center text-white/70 hover:text-white/90 transition-colors text-xs bg-white/10 rounded-full px-2.5 py-1.5"
                        >
                          View Portfolio
                          <span>
                            <ChevronRight size={14} color="#C7EF6B" />
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      data-tour="all-wallet-quick-actions"
                      className="flex items-center justify-center gap-6 mt-6"
                    >
                      <button
                        onClick={() => setTransferDrawer("deposit")}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                          <ArrowDown size={24} color="#fff" />
                        </div>
                        <span className="text-white font-medium text-xs">
                          Deposit
                        </span>
                      </button>
                      <button
                        onClick={() => setTransferDrawer("withdraw")}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                          <ArrowRight size={24} color="#fff" />
                        </div>
                        <span className="text-white font-medium text-xs">
                          Withdraw
                        </span>
                      </button>
                      <button
                        onClick={() => setShowAllBalancesDrawer(true)}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                          <CircleDollarSign size={24} color="#fff" />
                        </div>
                        <span className="text-white font-medium text-xs">
                          Assets
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center mb-4">
              <div className="h-1 w-8 bg-white/20 rounded-full" />
            </div>

            {/* System Notification Card - COMMENTED OUT
            {activeSystemNotifications.length > 0 ? (
              <div className="relative" data-tour="all-wallet-message-card">
                {activeSystemNotifications.length > 2 && (
                  <div
                    className="absolute inset-0 bg-[#151515] rounded-2xl border border-[#2a2a2a]"
                    style={{
                      transform: "translateY(8px) scale(0.96)",
                      opacity: 0.4,
                    }}
                  />
                )}
                {activeSystemNotifications.length > 1 && (
                  <div
                    className="absolute inset-0 bg-[#121212] rounded-2xl border border-[#2a2a2a]"
                    style={{
                      transform: "translateY(4px) scale(0.98)",
                      opacity: 0.6,
                    }}
                  />
                )}

                {(() => {
                  const notification = activeSystemNotifications[0];
                  return (
                    <div
                      key={notification.id}
                      className={`relative bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-3 overflow-hidden ${notification.metadata?.severity === "warning"
                          ? "border-yellow-500/30"
                          : notification.metadata?.severity === "error" ||
                            notification.metadata?.severity === "critical"
                            ? "border-red-500/30"
                            : "border-[#86B3F7]/30"
                        }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissNotification(notification.id);
                        }}
                        className="absolute top-3 right-3 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center transition-colors z-10"
                      >
                        <X size={14} color="#fff" />
                      </button>

                      <div className="flex items-start gap-3 pr-6">
                        <div
                          className={`shrink-0 w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center `}
                        >
                          <Bell
                            size={20}
                            color={
                              notification.metadata?.severity === "warning"
                                ? "#eab308"
                                : notification.metadata?.severity === "error" ||
                                  notification.metadata?.severity ===
                                  "critical"
                                  ? "#ef4444"
                                  : "#86B3F7"
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white text-sm font-medium">
                            {notification.title}
                          </h3>
                          <p className="text-white/60 text-xs leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              (() => {
                const status = campaignStatus as {
                  current_tier?: number;
                  enrollment?: object;
                } | null;
                const isCampaignOngoing =
                  !!status &&
                  (typeof status.current_tier === "number" ||
                    (status.enrollment &&
                      Object.keys(status.enrollment).length > 0));
                return (
                  <div
                    data-tour="all-wallet-message-card"
                    onClick={() => navigate("/earn")}
                    className={`mt-2 rounded-xl p-2 bg-[#2a2a2a] relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        <img
                          src="/campaign1.jpg"
                          alt="Early Savers Campaign"
                          className="w-14 h-16 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white text-[14px] font-medium">
                          Join early savers
                        </h3>
                        <p className="text-white/60 text-[13px]">
                          Earn rewards building a healthy savings habit.
                        </p>
                        <button className="mt-1 px-3 py-1.5 bg-[#C7EF6B] text-black rounded-full text-[11px] font-semibold hover:bg-[#B8E55A] transition-colors relative z-10">
                          Start earning
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
            */}

            {/* Add Cash Section */}
            <div data-tour="all-wallet-quick-deposit">
              <div className="flex items-center justify-between my-2 mt-4">
                <h2 className="text-white/70 text-xs font-medium">
                  Add Cash <span className="text-white">💸</span>
                </h2>
              </div>
              <div className="bg-[#2a2a2a] rounded-xl p-3">
                <div className="grid grid-cols-3 gap-2">
                  {ADD_CASH_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => navigate("/wallet/deposit/crypto")}
                      className="py-2.5 px-3 rounded-lg bg-white/10 text-white text-sm font-medium transition-colors"
                    >
                      ₦{(amount / 1000).toFixed(0)}K
                    </button>
                  ))}
                  <button
                    onClick={() => navigate("/wallet/deposit/crypto")}
                    className="py-2.5 px-3 rounded-lg bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <Plus size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Earn on Lisar Section */}
            <div data-tour="all-wallet-earn-section">
              <div className="flex items-center justify-between mb-4 mt-6">
                <h2 className="text-white/70 text-xs font-medium">
                  Earn on Lisar
                </h2>
              </div>

              <div className="space-y-4">
                {/* Savings Card */}
                <div
                  className="bg-[#6da7fd] rounded-2xl p-5 border-2 border-[#86B3F7]/30 hover:border-[#86B3F7]/50 transition-colors relative overflow-hidden"
                  data-tour="all-wallet-stables-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 relative z-10">
                      <h3 className="text-white text-base font-semibold mb-1">
                        Savings
                      </h3>
                      <p className="text-white/90 text-sm">
                        Earn steady returns on Lisar savings. Ideal for emergency funds that needs to be liquid.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/wallet/savings")}
                    className="mt-4 px-6 py-2.5 bg-[#438af6] text-white rounded-full text-xs font-semibold hover:bg-[#96C3F7] transition-colors relative z-10"
                  >
                    Start Saving
                  </button>

                  <img
                    src="/highyield-3.svg"
                    alt="Stables"
                    className="absolute bottom-[-20px] right-[-20px] w-28 h-28 object-contain opacity-80"
                  />
                </div>

                {/* Growth Card */}
                <div
                  className="bg-transparent rounded-2xl p-5 border-2 border-[#C7EF6B]/30 hover:border-[#C7EF6B]/50 transition-colors relative overflow-hidden"
                  data-tour="all-wallet-high-yield-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 relative z-10">
                      <h3 className="text-white text-base font-semibold mb-1">
                        Growth
                      </h3>
                      <p className="text-white/60 text-sm">
                        Earn higher returns on Lisar growth. Better for longer-term investment goals.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/wallet/staking")}
                    className="mt-4 px-6 py-2.5 bg-[#a3d039] text-black rounded-full text-xs font-semibold hover:bg-[#B8E55A] transition-colors relative z-10"
                  >
                    Start Earning
                  </button>

                  <img
                    src="/highyield-1.svg"
                    alt="High Yield"
                    className="absolute bottom-[-5px] right-[-5px] w-20 h-20 object-contain opacity-80"
                  />
                </div>

              </div>
            </div>
          </div>
        </>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/wallet" />

      <PortfolioSelectionDrawer
        isOpen={showPortfolioDrawer}
        onClose={() => setShowPortfolioDrawer(false)}
        onSelect={(portfolio) => {
          setShowPortfolioDrawer(false);
          navigate("/portfolio", {
            state: {
              walletType: portfolio === "savings" ? "savings" : "staking",
            },
          });
        }}
      />

      <AllBalancesDrawer
        isOpen={showAllBalancesDrawer}
        onClose={() => setShowAllBalancesDrawer(false)}
        ngnBalance={nairaBalance ?? 0}
        lptBalance={highyieldBalance}
        usdcBalance={solUsdcBalance}
        showBalance={showBalance}
      />

      <Drawer open={!!transferDrawer} onOpenChange={closeTransferDrawer}>
        <DrawerContent className="bg-[#050505] border-t border-[#1b1b1b]">
          <DrawerHeader className="pb-3">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-white text-base font-medium">
                {transferDrawer === "deposit" ? "Add Cash From" : "Cash Out To"}
              </DrawerTitle>
            </div>
          </DrawerHeader>
          <div className="pb-2 space-y-3">
            <button
              onClick={() => handleTransferOptionSelect("naira")}
              disabled={!NAIRA_OPTION_ENABLED}
              className={`w-full rounded-xl px-4 py-4 text-left ${NAIRA_OPTION_ENABLED
                  ? "bg-[#2a2a2a]"
                  : "bg-[#2a2a2a] opacity-50 cursor-not-allowed"
                }`}
            >
              <div className="flex items-center gap-3">
                <img src="/ng_flag.png" alt="Naira" className="w-10 h-10" />
                <div>
                  <p className="text-white text-sm font-medium">
                    {transferDrawer === "deposit"
                      ? "Naira Deposit"
                      : "Bank/Mobile Money"}
                  </p>
                  <p className="text-xs text-white/60">
                    {transferDrawer === "deposit"
                      ? "Deposit to your Lisar wallet"
                      : "Withdraw to your bank account"}
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleTransferOptionSelect("crypto")}
              className="w-full rounded-xl bg-[#2a2a2a] px-4 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <img src="/usdc.svg" alt="Crypto" className="w-10 h-10" />
                <div>
                  <p className="text-white text-sm font-medium">
                    {transferDrawer === "deposit"
                      ? "Crypto Wallet"
                      : "Send Crypto"}
                  </p>
                  <p className="text-xs text-white/60">
                    {transferDrawer === "deposit"
                      ? "Deposit from an external wallet"
                      : "Send to an external wallet address"}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
