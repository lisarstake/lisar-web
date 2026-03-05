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
import {
  Bell,
  CircleQuestionMark,
  Plus,
  Eye,
  EyeOff,
  X,
  ArrowDown,
  ArrowRight,
  Wallet,
  LayoutGrid,
  ChartNoAxesCombined,
} from "lucide-react";

const ADD_CASH_AMOUNTS = [20000, 50000, 100000, 250000, 500000];

export const AllWalletPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showBalanceDrawer, setShowBalanceDrawer] = useState(false);
  const [showAddCashDrawer, setShowAddCashDrawer] = useState(false);
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState(false);
  const [selectedAddAmount, setSelectedAddAmount] = useState<number | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"home" | "save" | "grow">("home");
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "NGN">("NGN");
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("wallet_show_balance");
    return saved ? JSON.parse(saved) : false;
  });

  const {
    activeSystemNotifications,
    dismissSystemNotification: handleDismissNotification,
  } = useNotification();

  useEffect(() => {
    localStorage.setItem("wallet_show_balance", JSON.stringify(showBalance));
  }, [showBalance]);

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

  const totalUsdBalance = useMemo(() => {
    const lptPriceInUsd = prices.lpt || 0;
    const unstakedLpt = highyieldBalance;
    const stakedLpt = delegatorStakeProfile
      ? parseFloat(delegatorStakeProfile.currentStake || "0")
      : 0;
    const totalLpt = unstakedLpt + stakedLpt;
    const lptUsdValue = totalLpt * lptPriceInUsd;
    const stablesUsdValue = stablesBalance;
    return lptUsdValue + stablesUsdValue;
  }, [highyieldBalance, stablesBalance, prices, delegatorStakeProfile]);

  const fiatCurrency = (state.user?.fiat_type || "USD").toUpperCase();
  const fiatSymbol = useMemo(
    () => priceService.getCurrencySymbol(fiatCurrency),
    [fiatCurrency],
  );

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
        title: "Total cash balance",
        balance: displayBalance,
        currencySymbol: displayCurrencySymbol,
        type: "main",
      },
    ],
    [displayBalance, displayCurrencySymbol],
  );

  return (
    <div className="h-screen overflow-hidden bg-[#050505] text-white flex flex-col">
      {/* Header */}
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[#13170a] hover:bg-[#3a3a3a] transition-colors cursor-pointer"
            >
              {showBalance ? (
                <Eye size={22} color="#fff" />
              ) : (
                <EyeOff size={22} color="#fff" />
              )}
            </button>
            <button
              onClick={handleNotificationClick}
              className="relative w-9 h-9 rounded-full flex items-center justify-center bg-[#13170a] hover:bg-[#3a3a3a] transition-colors cursor-pointer"
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


      <div className="flex-1 overflow-y-auto overscroll-contain">
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
                    className={`rounded-2xl py-5 min-h-[100px] relative overflow-hidden ${card.type !== "main"
                      ? "cursor-pointer hover:opacity-95 transition-opacity"
                      : ""
                      }`}
                    data-tour={
                      card.id === "main" ? "all-wallet-balance-card" : undefined
                    }
                  >
                    {/* Wallet Title */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <h3 className="text-white/70 text-xs">{card.title}</h3>
                      </div>

                      {/* Balance Display */}
                      <div>
                        {walletLoading ||
                          delegationLoading ||
                          stablesLoading ||
                          highyieldLoading ? (
                          <div className="flex items-baseline justify-center gap-2 mb-1">
                            <span className="text-xl font-bold text-white">
                              ★★★★
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-baseline justify-center gap-2 mb-1">
                            <span
                              className="text-xl font-bold text-white/90 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDisplayCurrency((c) =>
                                  c === "USD" ? "NGN" : "USD",
                                );
                              }}
                            >
                              {showBalance
                                ? `${card.currencySymbol}${card.balance.toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}`
                                : "★★★★"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center gap-6 mt-6">
                      <button
                        onClick={() => navigate("/deposit")}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#13170a] flex items-center justify-center">
                          <ArrowDown size={24} color="#fff" />
                        </div>
                        <span className="text-white font-medium text-xs">
                          Deposit
                        </span>
                      </button>
                      <button
                        onClick={() => navigate("/withdraw")}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#13170a] flex items-center justify-center">
                          <ArrowRight size={24} color="#fff" />
                        </div>
                        <span className="text-white font-medium text-xs">
                          Withdraw
                        </span>
                      </button>
                      <button
                        onClick={() => navigate("/accounts")}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#13170a] flex items-center justify-center">
                          <LayoutGrid size={24} color="#fff" />
                        </div>
                        <span className="text-white font-medium text-xs">
                          Accounts
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

            {/* System Notification Card */}
            {activeSystemNotifications.length > 0 ? (
              <div className="relative">
                {activeSystemNotifications.length > 2 && (
                  <div
                    className="absolute inset-0 bg-[#151515] rounded-2xl border border-[#13170a]"
                    style={{
                      transform: "translateY(8px) scale(0.96)",
                      opacity: 0.4,
                    }}
                  />
                )}
                {activeSystemNotifications.length > 1 && (
                  <div
                    className="absolute inset-0 bg-[#121212] rounded-2xl border border-[#13170a]"
                    style={{
                      transform: "translateY(4px) scale(0.98)",
                      opacity: 0.6,
                    }}
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
                        : notification.metadata?.severity === "error" ||
                          notification.metadata?.severity === "critical"
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
                        className="absolute top-3 right-3 w-6 h-6 bg-[#13170a] rounded-full flex items-center justify-center hover:bg-[#3a3a3a] transition-colors z-10"
                      >
                        <X size={14} color="#9a9a9a" />
                      </button>

                      <div className="flex items-start gap-3 pr-6">
                        <div
                          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.metadata?.severity === "warning"
                            ? "bg-yellow-500/20"
                            : notification.metadata?.severity === "error" ||
                              notification.metadata?.severity === "critical"
                              ? "bg-red-500/20"
                              : "bg-[#86B3F7]/20"
                            }`}
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
              /* Early Savers Campaign Card */
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
                const campaignStatusLabel = isCampaignOngoing
                  ? "ongoing"
                  : "not started";
                const borderColor = isCampaignOngoing
                  ? "border-[#C7EF6B]/60"
                  : "border-amber-500/80";
                return (
                  <div
                    onClick={() => navigate("/earn")}
                    className={`mt-2 rounded-xl p-3 bg-[#13170a] relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
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
                        <button className="mt-3 px-4 py-2 bg-[#C7EF6B] text-black rounded-full text-xs font-semibold hover:bg-[#B8E55A] transition-colors relative z-10">
                          Start earning
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Balance Section */}
            <div className="mt-6 bg-[#13170a] rounded-xl py-3 px-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white/70 text-xs font-medium">
                  My balance
                </h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/ng_flag.png" alt="NGN" className="w-10 h-10" />
                    <div>
                      <p className="text-white text-xs font-medium">NGN</p>
                      <p className="text-white/50 text-[10px] font-medium">
                        Naira
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-xs font-medium">O NGN</p>
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/us_flag.png" alt="USD" className="w-10 h-10" />
                    <div>
                      <p className="text-white text-xs font-medium">
                        USD (coming soon)
                      </p>
                      <p className="text-white/50 text-[10px] font-medium">
                        US Dollar
                      </p>
                    </div>
                  </div>
                  <div className="flex-col items-start justify-start gap-2">
                    <p className="text-white text-xs font-medium">O USD</p>
                    <p className="text-white/50 text-[10px] font-medium">
                      O NGN
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Section */}
            <button
              onClick={() => navigate("/wallet/savings/intro")}
              className="mt-6 w-full bg-[#13170a] rounded-xl py-3 px-4 text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white/70 text-xs font-medium">Savings</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                      <ChartNoAxesCombined size={22} color="#fff" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        Your money, working daily
                      </p>
                      <p className="text-white/50 text-[10px] font-medium">
                        Daily returns in USD or crypto. Flexible or fixed
                        savings
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Add Cash Section */}
            <div className="mt-6 bg-[#13170a] rounded-xl py-3 px-4 mb-20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white/70 text-xs font-medium">
                  Quick deposit <span className="text-white">💸</span>
                </h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ADD_CASH_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAddCashAmountClick(amount)}
                    className="py-2.5 px-3 rounded-lg bg-white/10 text-white text-sm font-medium transition-colors"
                  >
                    {fiatSymbol}
                    {(amount / 1000).toFixed(0)}K
                  </button>
                ))}
                <button
                  onClick={() => handleAddCashAmountClick(0)}
                  className="py-2.5 px-3 rounded-lg bg-white/10 flex items-center justify-center transition-colors"
                >
                  <Plus size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </>
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
          navigate("/portfolio", {
            state: {
              walletType: portfolio === "savings" ? "savings" : "staking",
            },
          });
        }}
      />
    </div>
  );
};
