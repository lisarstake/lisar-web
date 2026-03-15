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
import { YIELD_ASSET_PICKER_PATH } from "@/lib/yieldPaths";
import {
  Bell,
  Plus,
  Eye,
  EyeOff,
  X,
  ArrowDown,
  ArrowRight,
  CircleDollarSign,
} from "lucide-react";

const QUICK_DEPOSIT_AMOUNTS = [50, 100, 200, 500, 1000];
const YIELD_TREND_VALUES = [10, 12, 15, 19, 23, 28, 34, 45, 60];
const YIELD_PRIMARY_COLOR = "#C7EF6B";
const YIELD_AREA_COLOR = "rgba(199,239,107,0.18)";
const YIELD_CHART_HEIGHT = 40;
const YIELD_CHART_MIN_PERCENT = 0.8;
const YIELD_CHART_MAX_PERCENT = 0.45;
const YIELD_SHADOW_OFFSET = 100;
const YIELD_MARKER_INDEXES = [1, 3, 5, 7];

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
  const solUsdcBalance = solanaUsdcBalance || 0;
  const solUsdtBalance = solanaUsdtBalance || 0;
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
  const quickDepositSymbol = useMemo(
    () => priceService.getCurrencySymbol("USD"),
    [],
  );

  const yieldChartCoordinates = useMemo(() => {
    if (YIELD_TREND_VALUES.length < 2) return [];
    const max = Math.max(...YIELD_TREND_VALUES);
    const min = Math.min(...YIELD_TREND_VALUES);
    const range = max === min ? 1 : max - min;
    return YIELD_TREND_VALUES.map((value, index) => {
      const x = (index / (YIELD_TREND_VALUES.length - 1)) * 100;
      const normalized = (value - min) / range;
      const y =
        YIELD_CHART_HEIGHT *
        (YIELD_CHART_MIN_PERCENT -
          normalized * (YIELD_CHART_MIN_PERCENT - YIELD_CHART_MAX_PERCENT));
      return { x, y };
    });
  }, []);
  const yieldLinePoints = yieldChartCoordinates
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const yieldShadowPath = yieldChartCoordinates.length
    ? `${yieldChartCoordinates
        .map(
          (point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`,
        )
        .join(" ")} ${yieldChartCoordinates
        .slice()
        .reverse()
        .map(
          (point) =>
            `L${point.x},${Math.min(point.y + YIELD_SHADOW_OFFSET, YIELD_CHART_HEIGHT)}`,
        )
        .join(" ")} Z`
    : "";
  const yieldMarkerPositions = useMemo(() => {
    if (!yieldChartCoordinates.length) return [];
    return YIELD_MARKER_INDEXES.map((index, markerIndex) => {
      const point =
        yieldChartCoordinates[
          Math.min(index, yieldChartCoordinates.length - 1)
        ];
      return {
        id: `yield-marker-${markerIndex}`,
        x: point.x,
        y: point.y,
      };
    });
  }, [yieldChartCoordinates]);

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
    return fiatCurrency === "NGN"
      ? totalIdleUsdBalance * (prices.ngn || 0)
      : totalIdleUsdBalance;
  }, [fiatCurrency, totalIdleUsdBalance, prices.ngn]);

  const walletCards = useMemo(
    () => [
      {
        id: "main",
        title: "Total asset balance",
        balance: displayBalance,
        currencySymbol: fiatSymbol,
        type: "main",
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
                            <span className="text-xl font-bold text-white/90">
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
                      {/*
                        Accounts navigation temporarily paused while focus shifts
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
                      */}
                      <button
                        onClick={() => setShowAllBalancesDrawer(true)}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#13170a] flex items-center justify-center">
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
                    className={`mt-2 rounded-xl p-2 bg-[#13170a] relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
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

            {/* Add Cash Section */}
            <div className="flex items-center justify-between my-2 mt-4">
              <h2 className="text-white/70 text-xs font-medium">
                Quick deposit <span className="text-white">💸</span>
              </h2>
            </div>
            <div className="bg-[#13170a] rounded-xl p-3">
              <div className="grid grid-cols-3 gap-2">
                {QUICK_DEPOSIT_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => navigate("/wallet/deposit/crypto")}
                    className="py-2.5 px-3 rounded-lg bg-white/10 text-white text-sm font-medium transition-colors"
                  >
                    {quickDepositSymbol}
                    {amount.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
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

            {/* Yields section */}
            <div className="my-2 mt-4">
              <h2 className="text-white/70 text-xs font-medium">
                Earn yields <span className="text-white"></span>
              </h2>
            </div>
            <div
              onClick={() => navigate(YIELD_ASSET_PICKER_PATH)}
              className="w-full bg-[#13170a] rounded-xl p-3 text-left mb-20 cursor-pointer"
            >
              <div className="rounded-lg border border-white/5 bg-white/10 overflow-hidden relative">
                <svg
                  viewBox="0 0 100 40"
                  className="w-full h-20"
                  preserveAspectRatio="none"
                >
                  {yieldShadowPath && (
                    <path
                      d={yieldShadowPath}
                      fill={YIELD_AREA_COLOR}
                      opacity={0.5}
                    />
                  )}
                  {yieldLinePoints && (
                    <polyline
                      points={yieldLinePoints}
                      fill="none"
                      stroke={YIELD_PRIMARY_COLOR}
                      strokeWidth={0.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
                {yieldMarkerPositions.length > 0 && (
                  <div className="absolute inset-0">
                    {yieldMarkerPositions.map((marker, index) => (
                      <div
                        key={marker.id}
                        className="absolute"
                        style={{
                          left: `${marker.x}%`,
                          top: `${(marker.y / YIELD_CHART_HEIGHT) * 100}%`,
                          transform: "translate(-50%, -120%)",
                        }}
                      >
                        <img
                          src={
                            index === 0
                              ? "/usdc.svg"
                              : index === 1
                                ? "/sol1.svg"
                                : index === 2
                                  ? "/usdt.svg"
                                  : "/livepeer.webp"
                          }
                          alt="Yield asset"
                          className="w-6 h-6 animate-[yield-icon-drift_6s_ease-in-out_infinite]"
                          style={{ animationDelay: `${-index * 0.6}s` }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-white text-sm font-medium">
                        Your assets. Working daily
                      </p>
                      <p className="text-white/50 text-xs font-medium mt-0.5">
                        Daily returns on your assets. Withdraw anytime with no lock-up
                      </p>

                      <button className="mt-2.5 px-3 py-1.5 bg-[#C7EF6B] text-black rounded-full text-[13px] font-semibold hover:bg-[#B8E55A] transition-colors relative z-10">
                        Deposit to yield
                      </button>
                    </div>
                  </div>
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
        ngnBalance={0}
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
