import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { RecentTransactionsCard } from "../transactions/RecentTransactionsCard";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { EarningsBreakdownDrawer } from "../general/EarningsBreakdownDrawer";
import { PortfolioSelectionDrawer } from "@/components/general/PortfolioSelectionDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useWalletCard, WalletCardData } from "@/contexts/WalletCardContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useGuidedTour } from "@/hooks/useGuidedTour";
import { WALLET_PAGE_TOUR_ID } from "@/lib/tourConfig";
import { formatEarnings } from "@/lib/formatters";
import { TransactionData } from "@/services/transactions/types";
import {
  ArrowDown,
  ArrowLeft,
  Eye,
  EyeOff,
  SquareKanban,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

interface WalletPageProps {
  walletType?: string;
}

export const WalletPage: React.FC<WalletPageProps> = ({ walletType }) => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState(false);
  const [isCurrencyRotating, setIsCurrencyRotating] = useState(false);
  const [selectedEarningsCard, setSelectedEarningsCard] =
    useState<WalletCardData | null>(null);

  useEffect(() => {
    return () => {
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current);
      }
    };
  }, []);

  const { state } = useAuth();
  const { solanaUsdcBalance, stablesBalance } = useWallet();
  const { delegatorStakeProfile } = useDelegation();
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
    const card =
      cardData.find((item) => item.type === walletType) ??
      cardData.find((item) => item.type === "savings") ??
      null;
    setSelectedEarningsCard(card);
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
    walletType === "staking" ? 1 : 0,
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

  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
              (tx) => tx.token_symbol?.toUpperCase() !== "LPT",
            )
          : transactions;

    return filtered.slice(0, 5);
  }, [transactions, walletType]);

  const isSavingsWallet = walletType === "savings";
  const isStakingWallet = walletType === "staking";
  const activeWalletCard = useMemo(() => {
    if (walletType === "staking") {
      return cardData.find((item) => item.type === "staking") ?? null;
    }
    return cardData.find((item) => item.type === "savings") ?? null;
  }, [cardData, walletType]);

  const handleSavingsDeposit = () => {
    handleDepositClick();
  };

  const handleSavingsWithdraw = () => {
    handleWithdrawClick();
  };

  const handleSavingsDetails = () => {
    handlePortfolioClick();
  };

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

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-0">
        <button
          onClick={handleBackClick}
          className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
          >
            {showBalance ? (
              <Eye size={18} color="#fff" />
            ) : (
              <EyeOff size={18} color="#fff" />
            )}
          </button>
          <button
            onClick={() => setShowPortfolioDrawer(true)}
            className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
          >
            <RotateCcw size={18} color="#fff" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
        <div className="mt-10 text-center ">
          <p className="text-sm text-white/50">
            {isStakingWallet ? "Wallet balance" : "Wallet balance"}
          </p>
          {activeWalletCard?.isLoading ? (
            <div className="mt-2">
              {renderLoadingStars("text-lg font-semibold")}
            </div>
          ) : (
            <p className="mt-2 text-2xl font-bold text-white/90">
              {showBalance
                ? isStakingWallet
                  ? `${formatEarnings(
                      delegatorStakeProfile
                        ? parseFloat(delegatorStakeProfile.currentStake || "0")
                        : 0,
                    )} LPT`
                  : `${displayFiatSymbol}${(stablesBalance ?? 0).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )} USD`
                : "★★★★"}
            </p>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            onClick={handleSavingsDeposit}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13170a]">
              <ArrowDown size={24} className="text-[#e8ece9]" />
            </span>
            <span className="text-xs font-medium">Deposit</span>
          </button>

          <button
            onClick={handleSavingsWithdraw}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13170a]">
              <ArrowRight size={24} className="text-[#e8ece9]" />
            </span>
            <span className="text-xs font-medium">Withdraw</span>
          </button>

          <button
            onClick={handleSavingsDetails}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13170a]">
              <SquareKanban size={24} className="text-[#e8ece9]" />
            </span>
            <span className="text-xs font-medium">Overview</span>
          </button>
        </div>

        <div className="flex items-center justify-center mt-6 mb-4">
          <div className="h-1 w-8 bg-white/20 rounded-full" />
        </div>

        {activeWalletCard && (
          <div
            onClick={handleSavingsDetails}
            className={`mt-2 rounded-xl p-3 bg-[#13170a] relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <img
                  src="/crypto.png"
                  alt="Early Savers Campaign"
                  className="w-14 h-14 object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-[14px] font-medium">
                  You've earned{" "}
                  {displayCurrency === "NGN"
                    ? `${displayFiatSymbol}${(
                        activeWalletCard.projectedInterestNgn ?? 0
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : `${displayFiatSymbol}${(
                        activeWalletCard.projectedInterestUsd ?? 0
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })}`}{" "}
                  this week!
                </h3>
                <p className="text-white/60 text-[13px]">
                  Keep saving to earn more rewards
                </p>
                {/* <button className="mt-2 px-4 py-2 bg-[#C7EF6B] text-black rounded-full text-xs font-semibold hover:bg-[#B8E55A] transition-colors relative z-10">
               Add cash
             </button> */}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 ">
          <h2 className="text-sm text-white/80 mb-3">Recent transactions</h2>
          <RecentTransactionsCard
            transactions={recentTransactions}
            isLoading={transactionsLoading}
            onTransactionClick={handleTransactionClick}
            skeletonCount={4}
          />
        </div>
      </div>

      <BottomNavigation currentPath="/wallet" />

      <EarningsBreakdownDrawer
        isOpen={selectedEarningsCard !== null}
        onClose={() => setSelectedEarningsCard(null)}
        balance={selectedEarningsCard?.displayBalanceValue || 0}
        apyPercent={selectedEarningsCard?.apyPercent || 0}
        displayCurrency={displayCurrency}
        displayFiatSymbol={displayFiatSymbol}
        cardType={selectedEarningsCard?.type}
      />

      {/* Portfolio Selection Drawer */}
      <PortfolioSelectionDrawer
        isOpen={showPortfolioDrawer}
        onClose={() => setShowPortfolioDrawer(false)}
        onSelect={(portfolio) => {
          setShowPortfolioDrawer(false);
          if (portfolio === "savings") {
            if (stablesBalance && stablesBalance > 0) {
              navigate("/wallet/savings");
            } else {
              navigate("/wallet/savings/create-plan");
            }
          } else {
            const hasStaking =
              delegatorStakeProfile &&
              parseFloat(delegatorStakeProfile.currentStake || "0") > 0;
            if (hasStaking) {
              navigate("/wallet/staking");
            } else {
              navigate("/wallet/savings/create-plan");
            }
          }
        }}
      />
    </div>
  );
};
