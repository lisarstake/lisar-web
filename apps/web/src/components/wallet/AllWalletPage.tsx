import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { LisarLines } from "@/components/general/lisar-lines";
import { PortfolioSelectionDrawer } from "@/components/general/PortfolioSelectionDrawer";
import { AllBalancesDrawer } from "@/components/general/AllBalancesDrawer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  Clock,
} from "lucide-react";

const ADD_CASH_AMOUNTS = [20000, 50000, 100000, 250000, 500000];

export const AllWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAllBalancesDrawer, setShowAllBalancesDrawer] = useState(false);
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState(false);
  const [transferDrawer, setTransferDrawer] = useState<
    "deposit" | "withdraw" | null
  >(null);
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
    stablesBalance: contextStablesBalance,
    highyieldBalance: contextHighyieldBalance,
    solanaUsdcBalance,
    solanaUsdtBalance,
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

  const {} = useGuidedTour({
    tourId: ALL_WALLET_TOUR_ID,
    autoStart: shouldAutoStart,
  });

  const highyieldBalance = contextHighyieldBalance || 0;
  const stablesBalance = contextStablesBalance || 0;
  const solUsdcBalance = solanaUsdcBalance || 0;
  const solUsdtBalance = solanaUsdtBalance || 0;
  const stakingPosition = parseFloat(delegatorStakeProfile?.currentStake || "0");

  const totalIdleUsdBalance = useMemo(() => {
    const lptPriceInUsd = prices.lpt || 0;
    const unstakedLpt = highyieldBalance;
    const lptUsdValue = unstakedLpt * lptPriceInUsd;
    const idleUsdValue = solUsdcBalance + solUsdtBalance;
    return lptUsdValue + idleUsdValue;
  }, [highyieldBalance, solUsdcBalance, solUsdtBalance, prices]);

  const fiatCurrency = (state.user?.fiat_type || "USD").toUpperCase();
  const fiatSymbol = useMemo(
    () => priceService.getCurrencySymbol(fiatCurrency),
    [fiatCurrency],
  );

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
    return displayCurrency === "NGN"
      ? totalIdleUsdBalance * (prices.ngn || 0)
      : totalIdleUsdBalance;
  }, [displayCurrency, totalIdleUsdBalance, prices.ngn]);

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
                    className={`rounded-2xl py-5 min-h-[100px] relative overflow-hidden ${
                      card.type !== "main"
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
                            {renderLoadingStars("text-xl font-semibold")}
                          </div>
                        ) : (
                          <div className="flex items-baseline justify-center gap-2 mb-1">
                            <span className="text-2xl font-bold text-white/90">
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
                        onClick={() => setTransferDrawer("deposit")}
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
                        onClick={() => setTransferDrawer("withdraw")}
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
                      className={`relative bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-xl p-3 overflow-hidden ${
                        notification.metadata?.severity === "warning"
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
                        className="absolute top-3 right-3 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center transition-colors z-10"
                      >
                        <X size={14} color="#fff" />
                      </button>

                      <div className="flex items-start gap-3 pr-6">
                        <div
                          className={`shrink-0 w-10 h-10 bg-[#13170a] rounded-full flex items-center justify-center `}
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
                <button
                  onClick={() => setShowAllBalancesDrawer(true)}
                  className="text-[#C7EF6B] text-xs font-medium hover:opacity-80"
                >
                  Show all
                </button>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="/ng_flag.png" alt="NGN" className="w-10 h-10" />
                    <div>
                      <p className="text-white text-xs font-medium">NGN</p>
                      <p className="text-white/50 text-[10px] font-medium">
                        Naira
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-white text-xs font-medium">{showBalance ? "0 NGN" : "*****"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
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
                  <div className="flex-col items-start justify-start">
                    <p className="text-white text-xs font-medium">★ USD</p>
                    {/* <p className="text-white/50 text-[10px] f★nt-medium">
                    ★ NGN
                    </p> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Section */}
            <button
              onClick={() => {
                if (stablesBalance > 0) {
                  navigate("/wallet/savings");
                  return;
                }

                if (stakingPosition > 0) {
                  navigate("/wallet/staking");
                  return;
                }

                navigate("/wallet/savings/intro");
              }}
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
                    onClick={() => navigate("/wallet/deposit/naira")}
                    className="py-2.5 px-3 rounded-lg bg-white/10 text-white text-sm font-medium transition-colors"
                  >
                    {fiatSymbol}
                    {(amount / 1000).toFixed(0)}K
                  </button>
                ))}
                <button
                  onClick={() => navigate("/wallet/deposit/naira")}
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
        ngnBalance={0}
        usdBalance={0}
        lptBalance={highyieldBalance}
        usdcBalance={solUsdcBalance}
        usdtBalance={solUsdtBalance}
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
              className="w-full rounded-xl bg-[#13170a] px-4 py-4 text-left"
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
                      ? "Deposit Naira into your Lisar wallet"
                      : "Withdraw Naira to your bank account"}
                  </p>
                </div>
              </div>
            </button>

            <div className="w-full rounded-xl bg-[#13170a] px-4 py-4 opacity-70">
              <div className="flex items-center gap-3">
                <img src="/us_flag.png" alt="Dollar" className="w-10 h-10" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Dollar</p>
                  <p className="text-xs text-white/60 flex items-center">
                    USD transfer option is coming soon <Clock size={14} className="ml-1"/>
                  </p>
                </div>
              
              </div>
            </div>

            <button
              onClick={() => handleTransferOptionSelect("crypto")}
              className="w-full rounded-xl bg-[#13170a] px-4 py-4 text-left"
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
                      ? "Deposit crypto from an external wallet"
                      : "Send crypto to an external wallet address"}
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
