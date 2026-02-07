import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { LisarLines } from "@/components/general/lisar-lines";
import { AddCashDrawer } from "@/components/general/AddCashDrawer";
import { PortfolioSelectionDrawer } from "@/components/general/PortfolioSelectionDrawer";
import { WalletPage } from "@/components/wallet/WalletPage";
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
import { Bell, CircleQuestionMark, Plus, Eye, EyeOff, X, ChevronRight } from "lucide-react";
import { notificationService, SystemNotification } from "@/services/notifications";

const ADD_CASH_AMOUNTS = [20000, 50000, 100000, 250000, 500000];

export const AllWalletPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showBalanceDrawer, setShowBalanceDrawer] = useState(false);
  const [showAddCashDrawer, setShowAddCashDrawer] = useState(false);
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState(false);
  const [selectedAddAmount, setSelectedAddAmount] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "save" | "grow">("home");
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "NGN">("NGN");
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("wallet_show_balance");
    return saved ? JSON.parse(saved) : false;
  });

  // System notifications state
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("dismissed_system_notifications");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem("wallet_show_balance", JSON.stringify(showBalance));
  }, [showBalance]);

  // Persist dismissed notifications
  useEffect(() => {
    localStorage.setItem(
      "dismissed_system_notifications",
      JSON.stringify([...dismissedNotificationIds])
    );
  }, [dismissedNotificationIds]);

  // Fetch system notifications
  useEffect(() => {
    const fetchSystemNotifications = async () => {
      try {
        const response = await notificationService.getSystemNotifications({ limit: 10 });
        if (response.success && response.data) {
          setSystemNotifications(response.data);
        }
      } catch (error) {

      }
    };

    fetchSystemNotifications();
  }, []);

  // Filter out dismissed notifications
  const activeSystemNotifications = useMemo(() => {
    return systemNotifications.filter(
      (notification) => !dismissedNotificationIds.has(notification.id)
    );
  }, [systemNotifications, dismissedNotificationIds]);

  const handleDismissNotification = (notificationId: string) => {
    setDismissedNotificationIds((prev) => new Set([...prev, notificationId]));
  };

  const { orchestrators } = useOrchestrators();
  const { state } = useAuth();
  const {
    wallet,
    isLoading: walletLoading,
    stablesBalance: contextStablesBalance,
    highyieldBalance: contextHighyieldBalance,
    stablesLoading,
    highyieldLoading,
  } = useWallet();
  const { delegatorStakeProfile, isLoading: delegationLoading } =
    useDelegation();
  const { campaignStatus } = useCampaign();
  const { unreadCount } = useNotification();
  const { prices } = usePrices();
  // Start tour for non-onboarded users
  const shouldAutoStart = useMemo(() => {
    return state.user?.is_onboarded === false && !state.isLoading;
  }, [state.user?.is_onboarded, state.isLoading]);

  const { } = useGuidedTour({
    tourId: ALL_WALLET_TOUR_ID,
    autoStart: shouldAutoStart,
  });

  const highyieldBalance = contextHighyieldBalance || 0;
  const stablesBalance = contextStablesBalance || 0;

  // Total USD = EVM LPT in USD (unstaked + staked) + all USD stables
  const totalUsdBalance = useMemo(() => {
    const lptPriceInUsd = prices.lpt || 0;
    // Include both unstaked and staked LPT
    const unstakedLpt = highyieldBalance;
    const stakedLpt = delegatorStakeProfile
      ? parseFloat(delegatorStakeProfile.currentStake || "0")
      : 0;
    const totalLpt = unstakedLpt + stakedLpt;
    const lptUsdValue = totalLpt * lptPriceInUsd;
    const stablesUsdValue = stablesBalance; // already USD-equivalent units
    return lptUsdValue + stablesUsdValue;
  }, [highyieldBalance, stablesBalance, prices, delegatorStakeProfile]);

  const fiatCurrency = (state.user?.fiat_type || "USD").toUpperCase();
  const fiatSymbol = useMemo(
    () => priceService.getCurrencySymbol(fiatCurrency),
    [fiatCurrency]
  );

  const totalBalanceInPreferredCurrency = useMemo(() => {
    switch (fiatCurrency) {
      case "NGN":
        return totalUsdBalance * (prices.ngn || 0);
      case "EUR":
        return totalUsdBalance * (prices.eur || 0);
      case "GBP":
        return totalUsdBalance * (prices.gbp || 0);
      case "USD":
      default:
        return totalUsdBalance;
    }
  }, [totalUsdBalance, prices, fiatCurrency]);

  const handleAddCashAmountClick = (amount: number) => {
    setSelectedAddAmount(amount);
    setShowAddCashDrawer(true);
  };

  const handleAddCashDestination = (destination: "savings" | "growth") => {
    const amount = selectedAddAmount;
    setShowAddCashDrawer(false);
    setSelectedAddAmount(null);
    if (destination === "savings") {
      navigate("/deposit", {
        state: {
          walletType: "savings",
          provider: "perena",
          tierNumber: 2,
          tierTitle: "USD Plus",
          presetFiatAmount: amount ?? undefined,
        },
      });
    } else {
      navigate("/deposit", {
        state: {
          walletType: "staking",
          presetFiatAmount: amount ?? undefined,
        },
      });
    }
  };

  const handleNotificationClick = () => {
    navigate("/notifications");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleDepositClick = (walletType?: string) => {
    if (walletType === "main") {
      navigate("/deposit", { state: { walletType: undefined } });
      return;
    }
    if (walletType) {
      navigate(`/wallet/${walletType}`);
    } else {
      navigate("/deposit", { state: { walletType: undefined } });
    }
  };

  const displayBalance = useMemo(() => {
    return displayCurrency === "NGN"
      ? totalUsdBalance * (prices.ngn || 0)
      : totalUsdBalance;
  }, [displayCurrency, totalUsdBalance, prices.ngn]);

  const displayCurrencySymbol = displayCurrency === "NGN" ? "₦" : "$";

  const walletCards = useMemo(
    () => [
      {
        id: "main",
        title: "Total Balance",
        balance: displayBalance,
        currencySymbol: displayCurrencySymbol,
        type: "main",
        gradient: "from-[#0f0f0f] to-[#151515]",
      },
    ],
    [displayBalance, displayCurrencySymbol]
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Fixed Header */}
      <div className="bg-[#050505] shrink-0">
        <div className="flex items-center justify-between px-6 py-6">
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
              <span className="text-gray-100 text-xs">Welcome 👋</span>
              <span className="text-gray-100 text-sm font-medium">
                {state.user?.full_name?.split(" ")[0] || "User"}!
              </span>
            </div>
          </div>
          <button
            onClick={handleNotificationClick}
            className="relative w-10 h-10 rounded-full flex items-center justify-center bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors cursor-pointer"
          >
            <Bell size={20} color="#86B3F7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Home, Save, Grow Tabs */}
        {/* <div className="flex gap-3 px-7 pb-1">
          <button
            onClick={() => setActiveTab("home")}
            className={`py-2 text-lg transition-colors ${activeTab === "home" ? "text-white" : "text-white/50 hover:text-white/70"
              }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("save")}
            className={`py-2 text-lg transition-colors ${activeTab === "save" ? "text-white" : "text-white/50 hover:text-white/70"
              }`}
          >
            Save
          </button>
          <button
            onClick={() => setActiveTab("grow")}
            className={`py-2 text-lg transition-colors ${activeTab === "grow" ? "text-white" : "text-white/50 hover:text-white/70"
              }`}
          >
            Grow
          </button>
        </div> */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "home" ? (
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
                              <span
                                className="text-xl font-bold text-white/90 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDisplayCurrency((c) => (c === "USD" ? "NGN" : "USD"));
                                }}
                              >
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
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center my-4">
                <div className="h-1 w-8 bg-white/20 rounded-full" />
              </div>

              {/* System Notification Card */}
              {activeSystemNotifications.length > 0 ? (
                <div className="relative">

                  {activeSystemNotifications.length > 2 && (
                    <div
                      className="absolute inset-0 bg-[#151515] rounded-2xl border border-[#2a2a2a]"
                      style={{ transform: "translateY(8px) scale(0.96)", opacity: 0.4 }}
                    />
                  )}
                  {activeSystemNotifications.length > 1 && (
                    <div
                      className="absolute inset-0 bg-[#121212] rounded-2xl border border-[#2a2a2a]"
                      style={{ transform: "translateY(4px) scale(0.98)", opacity: 0.6 }}
                    />
                  )}

                  {/* Top card - the active notification */}
                  {(() => {
                    const notification = activeSystemNotifications[0];
                    return (
                      <div
                        key={notification.id}
                        className={`relative bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-3 overflow-hidden ${notification.metadata?.severity === "warning"
                          ? "border-yellow-500/30"
                          : notification.metadata?.severity === "error" || notification.metadata?.severity === "critical"
                            ? "border-red-500/30"
                            : "border-[#86B3F7]/30"
                          }`}
                      >
                        {/* Close Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismissNotification(notification.id);
                          }}
                          className="absolute top-3 right-3 w-6 h-6 bg-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#3a3a3a] transition-colors z-10"
                        >
                          <X size={14} color="#9a9a9a" />
                        </button>

                        <div className="flex items-start gap-3 pr-6">
                          <div
                            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.metadata?.severity === "warning"
                              ? "bg-yellow-500/20"
                              : notification.metadata?.severity === "error" || notification.metadata?.severity === "critical"
                                ? "bg-red-500/20"
                                : "bg-[#86B3F7]/20"
                              }`}
                          >
                            <Bell
                              size={20}
                              color={
                                notification.metadata?.severity === "warning"
                                  ? "#eab308"
                                  : notification.metadata?.severity === "error" || notification.metadata?.severity === "critical"
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
                /* Early Savers Campaign Card */
                (() => {
                  const status = campaignStatus as { current_tier?: number; enrollment?: object } | null;
                  const isCampaignOngoing =
                    !!status &&
                    (typeof status.current_tier === "number" ||
                      (status.enrollment && Object.keys(status.enrollment).length > 0));
                  const campaignStatusLabel = isCampaignOngoing
                    ? "ongoing"
                    : "not enrolled";
                  const borderColor = isCampaignOngoing
                    ? "border-[#C7EF6B]/60"
                    : "border-amber-500/80";
                  return (
                    <div
                      onClick={() => navigate("/earn")}
                      className={`mt-2 bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-3 border ${borderColor} relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="shrink-0">
                          <img
                            src="/campaign1.jpg"
                            alt="Early Savers Campaign"
                            className="w-12 h-14 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white text-[14px] font-medium">
                            Early Savers ({campaignStatusLabel})
                          </h3>
                          <p className="text-white/60 text-[13px]">
                            Earn rewards and perks building healthy saving habits.
                            {campaignStatusLabel === "not enrolled" && " Click to get started now!"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Add Cash Section */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white/70 text-sm font-medium">
                    Add Cash <span className="text-white">💸</span>
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ADD_CASH_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleAddCashAmountClick(amount)}
                      className="py-2.5 px-3 rounded-lg bg-linear-to-br from-[#0f0f0f] to-[#151515] text-white/80 text-sm font-medium transition-colors"
                    >
                      {fiatSymbol}{(amount / 1000).toFixed(0)}K
                    </button>
                  ))}
                  <button
                    onClick={() => handleAddCashAmountClick(0)}
                    className="py-2.5 px-3 rounded-lg bg-linear-to-br from-[#0f0f0f] to-[#151515] flex items-center justify-center transition-colors"
                  >
                    <Plus size={16} className="text-white/60" />
                  </button>
                </div>
              </div>
            </div>

            {/* Savings Plans Section */}
            <div className="px-6 pb-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white/70 text-sm font-medium">
                  Earn on Lisar
                </h2>
              </div>

              <div className="space-y-4">
                {/* Stables Card */}
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
                        Earn steady returns on stablecoin savings. Ideal for emergency funds and short-term goals.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/wallet/savings")}
                    className="mt-4 px-6 py-2.5 bg-[#438af6] text-white rounded-full text-xs font-semibold hover:bg-[#96C3F7] transition-colors relative z-10"
                  >
                    Start Saving
                  </button>

                  {/* Bottom Right Image */}
                  <img
                    src="/highyield-3.svg"
                    alt="Stables"
                    className="absolute bottom-[-20px] right-[-20px]  w-30 h-28 object-contain opacity-80"
                  />
                </div>

                {/* High Yield Card */}
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
                        Earn higher returns by staking. Better for long-term investment goals.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/wallet/staking")}
                    className="mt-4 px-6 py-2.5 bg-[#a3d039] text-black rounded-full text-xs font-semibold hover:bg-[#B8E55A] transition-colors relative z-10"
                  >
                    Start Earning
                  </button>

                  {/* Bottom Right Image */}
                  <img
                    src="/highyield-1.svg"
                    alt="High Yield"
                    className="absolute bottom-[-5px] right-[-5px] w-21 h-21 object-contain opacity-80"
                  />
                </div>

              </div>
            </div>
          </>
        ) : (
          <WalletPage walletType={activeTab === "save" ? "savings" : "staking"} embedded />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/wallet" />

      {/* Balance Information Drawer */}
      <HelpDrawer
        isOpen={showBalanceDrawer}
        onClose={() => setShowBalanceDrawer(false)}
        title="Total Balance"
        content={[
          "Your total balance combines all your wallet balances.",
          "This gives you a complete overview of your entire portfolio value.",
          "You can tap on the balance to show/hide.",
        ]}
      />

      <AddCashDrawer
        isOpen={showAddCashDrawer}
        onClose={() => {
          setShowAddCashDrawer(false);
          setSelectedAddAmount(null);
        }}
        selectedAmount={selectedAddAmount}
        onSelectDestination={handleAddCashDestination}
      />

      <PortfolioSelectionDrawer
        isOpen={showPortfolioDrawer}
        onClose={() => setShowPortfolioDrawer(false)}
        onSelect={(portfolio) => {
          setShowPortfolioDrawer(false);
          navigate("/portfolio", { state: { walletType: portfolio === "savings" ? "savings" : "staking" } });
        }}
      />
    </div>
  );
};
