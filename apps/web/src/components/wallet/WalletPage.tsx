import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { WalletActionButtons } from "./WalletActionButtons";
import { RecentTransactionsCard } from "./RecentTransactionsCard";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { EarningsBreakdownDrawer } from "../general/EarningsBreakdownDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useWalletCard, WalletCardData } from "@/contexts/WalletCardContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useGuidedTour } from "@/hooks/useGuidedTour";
import { WALLET_PAGE_TOUR_ID } from "@/lib/tourConfig";
import { formatEarnings, formatStables } from "@/lib/formatters";
import { TransactionData } from "@/services/transactions/types";
import { CircleQuestionMark, ChevronLeft, Eye, EyeOff, RefreshCw } from "lucide-react";

interface WalletPageProps {
  walletType?: string;
  embedded?: boolean;
}

export const WalletPage: React.FC<WalletPageProps> = ({ walletType, embedded }) => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [isCurrencyRotating, setIsCurrencyRotating] = useState(false);
  const [selectedEarningsCard, setSelectedEarningsCard] = useState<WalletCardData | null>(null);

  useEffect(() => {
    return () => {
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current);
      }
    };
  }, []);

  const { state } = useAuth();
  const { solanaUsdcBalance } = useWallet();
  const {
    cardData,
    displayCurrency,
    setDisplayCurrency,
    showBalance,
    setShowBalance,
    displayFiatSymbol,
  } = useWalletCard();
  useNotification();
  const { transactions, isLoading: transactionsLoading } = useTransactions();

  // Start tour for non-onboarded users
  const shouldAutoStart = useMemo(() => {
    return state.user?.is_onboarded === false && !state.isLoading;
  }, [state.user?.is_onboarded, state.isLoading]);

  const { isCompleted: isTourCompleted, startTour } = useGuidedTour({
    tourId: WALLET_PAGE_TOUR_ID,
    autoStart: shouldAutoStart,
  });




  const handleStakeClick = () => {
    if (walletType === "savings") {
      const perenaBalance = solanaUsdcBalance ?? 0;
      if (perenaBalance > 0) {
        navigate("/save", {
          state: {
            walletType: "savings",
            tierNumber: 2,
            tierTitle: "USD Plus",
            provider: "perena",
          },
        });
      } else {
        navigate("/deposit", {
          state: {
            walletType: "savings",
            tierNumber: 2,
            tierTitle: "USD Plus",
            provider: "perena",
            returnTo: "/wallet/savings",
          },
        });
      }
    } else {
      navigate("/validator", {
        state: { tierNumber: 1, tierTitle: "Flexible", tierName: "Flexible" },
      });
    }
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleCurrencyToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayCurrency(displayCurrency === "USD" ? "NGN" : "USD");
    setIsCurrencyRotating(true);
    setTimeout(() => setIsCurrencyRotating(false), 600);
  };

  const handleDepositClick = () => {
    if (walletType === "savings") {
      navigate("/deposit", {
        state: {
          walletType: "savings",
          tierNumber: 2,
          tierTitle: "USD Plus",
          provider: "perena",
        },
      });
    } else {
      navigate(`/deposit`, { state: { walletType } });
    }
  };

  const handlePortfolioClick = () => {
    navigate("/portfolio", { state: { walletType } });
  };

  const handleWithdrawClick = () => {
    if (walletType === "savings") {
      navigate("/withdraw", {
        state: {
          walletType: "savings",
          tierNumber: 2,
          tierTitle: "USD Plus",
          provider: "perena",
        },
      });
    } else {
      navigate("/withdraw", { state: { walletType } });
    }
  };

  const handleBackClick = () => {
    navigate("/wallet");
  };

  const handleTransactionClick = (transaction: TransactionData) => {
    navigate(`/transaction-detail/${transaction.id}`);
  };

  const handleViewAllTransactions = () => {
    if (walletType) {
      navigate("/history", { state: { walletType } });
    } else {
      navigate("/history");
    }
  };

  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(
    walletType === "staking" ? 1 : 0
  );

  const CARD_WIDTH_RATIO = 0.92;

  useEffect(() => {
    const idx = walletType === "staking" ? 1 : 0;
    setCarouselIndex(idx);
    const scrollToCard = () => {
      if (carouselRef.current) {
        const { offsetWidth } = carouselRef.current;
        const cardWidth = offsetWidth * CARD_WIDTH_RATIO + 12;
        carouselRef.current.scrollTo({
          left: idx * cardWidth,
          behavior: "smooth",
        });
      }
    };
    requestAnimationFrame(scrollToCard);
  }, [walletType]);

  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, offsetWidth } = carouselRef.current;
    const cardWidth = offsetWidth * CARD_WIDTH_RATIO + 12;
    const index = Math.round(scrollLeft / cardWidth);
    const clamped = Math.min(Math.max(index, 0), 1);
    setCarouselIndex(clamped);

    if (scrollEndTimeoutRef.current) {
      clearTimeout(scrollEndTimeoutRef.current);
    }
    scrollEndTimeoutRef.current = setTimeout(() => {
      scrollEndTimeoutRef.current = null;
      if (clamped === 0 && walletType !== "savings") {
        navigate("/wallet/savings");
      } else if (clamped === 1 && walletType !== "staking") {
        navigate("/wallet/staking");
      }
    }, 150);
  }, [walletType, navigate]);

  const recentTransactions = useMemo(() => {
    const filtered =
      walletType === "staking"
        ? transactions.filter((tx) => tx.token_symbol?.toUpperCase() === "LPT")
        : walletType === "savings"
          ? transactions.filter(
            (tx) => tx.token_symbol?.toUpperCase() !== "LPT"
          )
          : transactions;

    return filtered.slice(0, 5);
  }, [transactions, walletType]);

  return (
    <div className={embedded ? "flex flex-col" : "h-screen bg-[#050505] text-white flex flex-col"}>
      {!embedded && (
        <div className="flex items-center justify-between px-6 py-8">
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center"
          >
            <ChevronLeft color="#C7EF6B" />
          </button>
          <h1 className="text-lg font-medium text-white">Wallet</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleHelpClick}
              className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
              data-tour="wallet-page-help-icon"
            >
              <CircleQuestionMark color="#86B3F7" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Wallet Card Carousel */}
      {walletType && (
        <div className="px-6 pb-6">
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {cardData.map((card) => {
              const isSavings = card.type === "savings";
              const displayInterest =
                displayCurrency === "NGN"
                  ? card.projectedInterestNgn
                  : card.projectedInterestUsd;
              return (
                <div
                  key={card.type}
                  className="flex-[0_0_calc(97%-6px)] shrink-0 snap-center min-w-0"
                >
                  <div
                    className={`${isSavings
                      ? "bg-[#6da7fd] border-2 border-[#86B3F7]/30 hover:border-[#86B3F7]/50"
                      : "bg-transparent border-2 border-[#C7EF6B]/30 hover:border-[#C7EF6B]/50"
                      } rounded-2xl p-5 relative overflow-hidden transition-colors min-h-[160px]`}
                    data-tour={
                      card.type === "savings" ? "wallet-page-balance" : undefined
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 relative z-10">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <h3
                              className={`text-sm font-medium ${isSavings
                                ? "text-white/90"
                                : "text-white/80"
                                }`}
                            >
                              {card.title}
                            </h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowBalance(!showBalance);
                              }}
                              className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                            >
                              {showBalance ? (
                                <Eye
                                  size={18}
                                  color={
                                    isSavings
                                      ? "rgba(255, 255, 255, 0.8)"
                                      : "rgba(199, 239, 107, 0.8)"
                                  }
                                />
                              ) : (
                                <EyeOff
                                  size={18}
                                  color={
                                    isSavings
                                      ? "rgba(255, 255, 255, 0.8)"
                                      : "rgba(199, 239, 107, 0.8)"
                                  }
                                />
                              )}
                            </button>
                          </div>
                          <button
                            onClick={handleCurrencyToggle}
                            className={`text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${isSavings
                              ? "bg-white/20 text-white hover:bg-white/30"
                              : "bg-white/10 text-white/90 hover:bg-white/20"
                              }`}
                          >
                            {displayCurrency}{" "}
                            <RefreshCw
                              className={isCurrencyRotating ? "animate-[spin_0.6s_ease-in-out_1]" : ""}
                              size={12}
                            />
                          </button>
                        </div>

                        <div className="mb-2">
                          {card.isLoading ? (
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xl font-bold text-white/90">
                                ••••
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-baseline mb-1">
                              {showBalance && displayCurrency === "NGN" && (
                                <span
                                  className={`text-xl font-bold ${isSavings
                                    ? "text-white/90"
                                    : "text-white/70"
                                    }`}
                                >
                                  {displayFiatSymbol}
                                </span>
                              )}
                              <span className="text-xl font-bold text-white/90">
                                {showBalance
                                  ? displayCurrency === "NGN"
                                    ? card.displayBalanceValue.toLocaleString(
                                      undefined,
                                      {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }
                                    )
                                    : isSavings
                                      ? formatStables(card.balance)
                                      : formatEarnings(card.balance)
                                  : "••••"}
                              </span>
                              {showBalance && displayCurrency !== "NGN" && (
                                <span
                                  className={`text-sm ml-[3px] ${isSavings
                                    ? "text-white/90"
                                    : "text-white/70"
                                    }`}
                                >
                                  {isSavings ? "USD" : "LPT"}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-2 left-2 z-10 flex gap-2">
                      <button
                        onClick={() => setSelectedEarningsCard(card)}
                        className={`w-fit rounded-xl px-3.5 py-1.5 text-left transition-colors hover:opacity-80 ${isSavings
                          ? "bg-white/20"
                          : "bg-white/10"
                          }`}
                      >
                        <p className="text-white/80 text-[10px] mb-0.5">
                          Interest earned this week
                        </p>
                        <p className="text-white text-sm font-semibold">
                          {displayFiatSymbol}
                          {displayInterest.toLocaleString(undefined, {
                            minimumFractionDigits:
                              displayCurrency === "NGN" ? 2 : 3,
                            maximumFractionDigits:
                              displayCurrency === "NGN" ? 2 : 3,
                          })}
                          <span className="text-white/70 text-xs font-normal ml-1">
                            at ({card.apyPercent}% p.a)
                          </span>
                        </p>
                      </button>
                    </div>

                    {isSavings ? (
                      <img
                        src="/highyield-3.svg"
                        alt="Stables"
                        className="absolute bottom-[-20px] right-[-20px] w-30 h-28 object-contain opacity-80"
                      />
                    ) : (
                      <img
                        src="/highyield-1.svg"
                        alt="High Yield"
                        className="absolute bottom-[-5px] right-[-5px] w-21 h-21 object-contain opacity-80"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center gap-2 mt-2">
            {cardData.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === carouselIndex
                  ? "w-6 bg-[#86B3F7]"
                  : "w-1.5 bg-white/30"
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <WalletActionButtons
        onDepositClick={handleDepositClick}
        onStakeClick={handleStakeClick}
        onPortfolioClick={handlePortfolioClick}
        onWithdrawClick={handleWithdrawClick}
        walletType={walletType}
      />

      {/* Recent Transactions */}
      <div className={`flex-1 px-6 pt-6 overflow-y-auto ${embedded ? "pb-6" : "pb-20"}`}>
        <div className="flex items-center justify-between mb-3 px-2">
          <h2 className="text-white/80 text-sm font-medium">
            Recent transactions
          </h2>
          {transactions.length > 0 && (
            <button
              onClick={handleViewAllTransactions}
              className={`${walletType === "savings" ? "text-[#86B3F7]" : "text-[#C7EF6B]"} text-sm hover:opacity-70 transition-opacity`}
            >
              See all
            </button>
          )}
        </div>

        {/* Transactions Card */}
        <RecentTransactionsCard
          transactions={recentTransactions}
          isLoading={transactionsLoading}
          onTransactionClick={handleTransactionClick}
          skeletonCount={5}
        />
      </div>

      {!embedded && (
        <>
          <BottomNavigation currentPath="/wallet" />
        </>
      )}

      {/* Balance Information Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title={
          walletType === "savings"
            ? "About Savings"
            : "About Growth Fund"
        }
        content={
          walletType === "savings"
            ? [
              "Stables offers lower yields with instant withdrawal capabilities.",
              "Perfect for emergency funds and short-term savings with stable returns.",
            ]
            : [
              "High Yield offers higher APYs for maximum returns on your investment.",
              "Withdrawals are subject to a 7-day unbonding period before funds become available.",
            ]
        }
      />

      {/* Earnings Breakdown Drawer */}
      <EarningsBreakdownDrawer
        isOpen={selectedEarningsCard !== null}
        onClose={() => setSelectedEarningsCard(null)}
        balance={selectedEarningsCard?.displayBalanceValue || 0}
        apyPercent={selectedEarningsCard?.apyPercent || 0}
        displayCurrency={displayCurrency}
        displayFiatSymbol={displayFiatSymbol}
        cardType={selectedEarningsCard?.type}
      />
    </div>
  );
};
