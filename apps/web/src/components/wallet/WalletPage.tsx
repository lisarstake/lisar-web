import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RecentTransactionsCard } from "../transactions/RecentTransactionsCard";
import { TransactionDetailsDrawer } from "../transactions/TransactionDetailsDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { DepositActionDrawer } from "@/components/general/DepositActionDrawer";
import { SuccessDrawer } from "@/components/general/SuccessDrawer";
import { WithdrawActionDrawer } from "@/components/general/WithdrawActionDrawer";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useWalletCard } from "@/contexts/WalletCardContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStablesApy } from "@/hooks/useStablesApy";
import { usePerenaWeeklyYield } from "@/hooks/usePerenaWeeklyYield";
import { usePrices } from "@/hooks/usePrices";
import { getEarliestUnbondingTime } from "@/lib/unbondingTime";
import { getOrchestratorDisplayName } from "@/lib/orchestrators";
import { TransactionData } from "@/services/transactions/types";
import { delegationService } from "@/services";
import { YIELD_ASSET_PICKER_PATH } from "@/lib/yieldPaths";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CircleDollarSign,
  CircleQuestionMark,
  Eye,
  EyeOff,
  Info,
  PiggyBank,
  Sprout,
} from "lucide-react";
import { LisarLines } from "@/components/landing/lisar-lines";

interface WalletPageProps {
  walletType?: string;
}

type EarningsCardState = "default" | "empty" | "unbonding" | "withdraw-ready";

const WALLET_VISUALS = {
  savings: {
    coinName: "USDC",
    coinSymbol: "USD",
    icon: "/usdc.svg",
    cardGradient:
      "bg-[linear-gradient(155deg,#0096FF_0%,#34AEFF_50%,#8DD4FF_100%)] border-[#8DD4FF]/65",
  },
  flex: {
    coinName: "USDC",
    coinSymbol: "USD",
    icon: "/usdt.svg",
    cardGradient:
      "bg-[linear-gradient(155deg,#a78bfa_0%,#c4b5fd_50%,#ddd6fe_100%)] border-[#a78bfa]/65",
  },
  staking: {
    coinName: "Livepeer",
    coinSymbol: "LPT",
    icon: "/livepeer.webp",
    cardGradient:
      "bg-[linear-gradient(155deg,#006400_0%,#8DD4FF_180%)] border-[#006400]/65",
  },

} as const;

export const WalletPage: React.FC<WalletPageProps> = ({ walletType: propWalletType }) => {
  const { walletType: paramWalletType } = useParams<{ walletType?: string }>();
  const walletType = propWalletType || paramWalletType;
  const navigate = useNavigate();
  const currentWalletType = walletType === "staking" ? "staking" : walletType === "flex" ? "flex" : "savings";
  const [showDepositDrawer, setShowDepositDrawer] = useState(false);
  const [showWithdrawDrawer, setShowWithdrawDrawer] = useState(false);
  const [showWithdrawEmptyDrawer, setShowWithdrawEmptyDrawer] = useState(false);
  const [showEarningsDrawer, setShowEarningsDrawer] = useState(false);
  const [showTokenInfoDrawer, setShowTokenInfoDrawer] = useState(false);
  const [showUnlockSuccessDrawer, setShowUnlockSuccessDrawer] = useState(false);
  const [showUnlockErrorDrawer, setShowUnlockErrorDrawer] = useState(false);
  const [unlockErrorMessage, setUnlockErrorMessage] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionData | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const getInitialCarouselIndex = () => {
    if (currentWalletType === "staking") return 1;
    return 0;
  };
  const [carouselIndex, setCarouselIndex] = useState(getInitialCarouselIndex());
  const scrollEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    highyieldBalance,
    stablesBalance,
    solanaWalletAddress,
    refreshAllWalletData,
  } = useWallet();
  const {
    delegatorStakeProfile,
    userDelegation,
    delegatorTransactions,
    refetch: refetchDelegation,
  } = useDelegation();
  const { state } = useAuth();
  const { orchestrators } = useOrchestrators();
  const { perena: perenaApy, isLoading: apyLoading } = useStablesApy();
  const {
    cardData,
    displayCurrency,
    showBalance,
    setShowBalance,
    displayFiatSymbol,
  } = useWalletCard();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: perenaWeeklyYieldData } = usePerenaWeeklyYield(
    solanaWalletAddress || null,
  );
  const { prices } = usePrices();

  const isStakingWallet = walletType === "staking";
  const isFlexWallet = walletType === "flex";

  const CARD_WIDTH_RATIO = 0.92;

  useEffect(() => {
    const getIdx = () => {
      if (currentWalletType === "staking") return 1; 
      return 0;                                   
    };
    const idx = getIdx();
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
  }, [currentWalletType]);

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
      if (clamped === 0 && currentWalletType !== "savings") {
        navigate("/wallet/savings", { replace: true });
      } else if (clamped === 1 && currentWalletType !== "staking") {
        navigate("/wallet/staking", { replace: true });
      }
    }, 150);
  }, [currentWalletType, navigate]);
  const stakedBalance = parseFloat(delegatorStakeProfile?.currentStake || "0");
  const activeWalletCard = useMemo(() => {
    if (walletType === "staking") {
      return cardData.find((item) => item.type === "staking") ?? null;
    }
    if (walletType === "flex") {
      return cardData.find((item) => item.type === "flex") ?? null;
    }
    return cardData.find((item) => item.type === "savings") ?? null;
  }, [cardData, walletType]);
  const walletVisual = isStakingWallet
    ? WALLET_VISUALS.staking
    : isFlexWallet
      ? WALLET_VISUALS.flex
      : WALLET_VISUALS.savings;
  const assetBalance = activeWalletCard?.balance ?? 0;
  const formattedAssetBalance = `${assetBalance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })} ${walletVisual.coinSymbol}`;

  const displayBalance = useMemo(() => {
    if (displayCurrency === "NGN") {
      const ngnRate = prices.ngn || 0;
      return `${displayFiatSymbol}${(assetBalance * ngnRate).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `${displayFiatSymbol}${assetBalance.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [displayCurrency, assetBalance, prices.ngn, displayFiatSymbol]);
  const tokenLiveApyPercent = useMemo(() => {
    if (isStakingWallet) {
      const delegateId = userDelegation?.delegate?.id;
      const normalizedDelegateId = delegateId?.toLowerCase();
      const matchedOrchestrator = orchestrators.find(
        (orch) => orch.address?.toLowerCase() === normalizedDelegateId,
      );
      const rawApy = matchedOrchestrator?.apy;

      if (typeof rawApy === "string") {
        const parsed = parseFloat(rawApy.replace("%", ""));
        if (Number.isFinite(parsed)) return parsed;
      }

      if (typeof rawApy === "number" && Number.isFinite(rawApy)) {
        return rawApy;
      }

      return 48;
    }
    if (perenaApy !== null) return perenaApy * 100;
    const fallback = parseFloat(activeWalletCard?.apyPercent || "");
    return Number.isFinite(fallback) ? fallback : null;
  }, [
    activeWalletCard?.apyPercent,
    isStakingWallet,
    orchestrators,
    perenaApy,
    userDelegation?.delegate?.id,
  ]);
  const tokenInfoDescription = isStakingWallet
    ? "Earn yields daily with 7 days unlock period for withdrawals."
    : isFlexWallet
      ? "Set a daily spend limit that gets sent to your account daily, while the rest grows"
      : "Earn yields daily with instant withdrawal.";

  const currentValidatorName = useMemo(() => {
    if (!isStakingWallet) return null;
    const delegateId = userDelegation?.delegate?.id;
    if (!delegateId) return "--";
    // const normalizedDelegateId = delegateId.toLowerCase();
    const match = orchestrators.find(
      (orch) => orch.address === delegateId,
    );

    if (match) {
      return getOrchestratorDisplayName(match);
    }

    return "Unknown validator";
  }, [isStakingWallet, orchestrators, userDelegation?.delegate?.id]);

  const sevenDayEarnings = useMemo(() => {
    const weeklyTotal = !isStakingWallet
      ? perenaWeeklyYieldData?.earnings ?? perenaWeeklyYieldData?.yieldAmount ?? 0
      : tokenLiveApyPercent !== null
        ? (assetBalance * tokenLiveApyPercent * 7) / (100 * 365)
        : 0;
    const dailyYield = weeklyTotal > 0 ? weeklyTotal / 7 : 0;
    const dailyYields = Array.from({ length: 7 }).map(() => dailyYield);

    const totalYield = dailyYields.reduce((sum, value) => sum + value, 0);
    const baseBalance = Math.max(assetBalance - totalYield, 0);

    const formatDate = (value: Date) => {
      const day = `${value.getDate()}`.padStart(2, "0");
      const month = `${value.getMonth() + 1}`.padStart(2, "0");
      const year = value.getFullYear();
      return `${day}-${month}-${year}`;
    };

    let runningBalance = baseBalance;
    const oldestToNewest = Array.from({ length: 7 }).map((_, index) => {
      const offsetFromToday = 6 - index;
      const date = new Date();
      date.setDate(date.getDate() - offsetFromToday);
      const interest = dailyYields[offsetFromToday] || 0;
      runningBalance += interest;
      return {
        id: `earning-${offsetFromToday}`,
        date: formatDate(date),
        interest,
        balance: runningBalance,
      };
    });

    return oldestToNewest.reverse();
  }, [
    assetBalance,
    isStakingWallet,
    perenaWeeklyYieldData,
    tokenLiveApyPercent,
  ]);

  const pendingUnbondingData = useMemo(() => {
    const pending = delegatorTransactions?.pendingStakeTransactions ?? [];
    const count = pending.length;
    const totalAmount = pending.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || "0"),
      0,
    );
    const timeRemaining = getEarliestUnbondingTime(pending);
    return { count, totalAmount, timeRemaining };
  }, [delegatorTransactions]);

  const completedUnbondingData = useMemo(() => {
    const completed = delegatorTransactions?.completedStakeTransactions ?? [];
    const totalAmount = completed.reduce(
      (sum, tx) => sum + parseFloat(tx.amount || "0"),
      0,
    );
    const validatorId =
      completed.find((tx) => tx.delegate?.id)?.delegate?.id || null;
    return { totalAmount, validatorId };
  }, [delegatorTransactions]);
  const unlockedUnbondingLockId = useMemo(() => {
    const completed = delegatorTransactions?.completedStakeTransactions ?? [];
    return completed.find((tx) => typeof tx.unbondingLockId === "number")
      ?.unbondingLockId;
  }, [delegatorTransactions]);

  const availableWithdrawalDisplay = useMemo(() => {
    const lptAmount = completedUnbondingData.totalAmount;
    const lptPriceInUsd = prices.lpt || 0;
    const usdValue = lptAmount * lptPriceInUsd;
    const ngnRate = prices.ngn || 0;

    if (displayCurrency === "NGN") {
      return `${displayFiatSymbol}${(usdValue * ngnRate).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }
    return `${displayFiatSymbol}${usdValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [completedUnbondingData.totalAmount, displayCurrency, prices.lpt, prices.ngn, displayFiatSymbol]);

  const totalStakingBalance = (highyieldBalance || 0) + stakedBalance;
  const withdrawableWalletBalance =
    walletType === "staking" ? stakedBalance : stablesBalance || 0;
  const zeroBalance =
    walletType === "staking"
      ? totalStakingBalance <= 0
      : (stablesBalance || 0) <= 0;
  // Flex uses same balance as Savings
  const hasPendingUnbonding = pendingUnbondingData.count > 0;
  const hasCompletedUnbonding =
    completedUnbondingData.totalAmount > 0 &&
    Boolean(completedUnbondingData.validatorId);

  const earningsCardState = useMemo<EarningsCardState>(() => {
    if (isStakingWallet && hasCompletedUnbonding) return "withdraw-ready";
    if (isStakingWallet && hasPendingUnbonding) return "unbonding";
    if (zeroBalance) return "empty";
    return "default";
  }, [isStakingWallet, hasCompletedUnbonding, hasPendingUnbonding, zeroBalance]);

  const recentTransactions = useMemo(() => {
    const savingsTxTypes = ["mint", "burn"];
    const stakingTxTypes = ["delegation", "undelegation"];

    return transactions
      .filter((tx) => {
        const isLpt = tx.token_symbol?.toUpperCase() === "LPT";
        if (walletType === "savings" || walletType === "flex") {
          return savingsTxTypes.includes(tx.transaction_type) && !isLpt;
        }
        if (walletType === "staking") {
          return stakingTxTypes.includes(tx.transaction_type) && isLpt;
        }
        return false;
      })
      .slice(0, 5);
  }, [transactions, walletType]);

  const handleBackClick = () => {
    // Navigate to main wallet page and replace history
    // Prevents yield intro pages from showing again when going back
    navigate("/wallet", { replace: true });
  };

  const handleDepositClick = () => {
    setShowDepositDrawer(true);
  };

  const handleWithdrawClick = () => {
    if (withdrawableWalletBalance <= 0) {
      setShowWithdrawEmptyDrawer(true);
      return;
    }
    setShowWithdrawDrawer(true);
  };

  const handleDepositToNaira = () => {
    setShowDepositDrawer(false);
    navigate(`/wallet/deposit/naira?walletType=${currentWalletType}`);
  };

  const handleDepositToCrypto = () => {
    setShowDepositDrawer(false);
    navigate(`/wallet/deposit/crypto?walletType=${currentWalletType}`);
  };

  const handleWithdrawToNaira = () => {
    setShowWithdrawDrawer(false);
    navigate(`/wallet/convert/withdraw/${currentWalletType}`);
  };

  const handleWithdrawToCrypto = () => {
    setShowWithdrawDrawer(false);
    navigate(`/wallet/withdraw/crypto?walletType=${currentWalletType}`);
  };

  const handleTransactionClick = (transaction: TransactionData) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div className="min-h-full bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-0">
        <button
          onClick={handleBackClick}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTokenInfoDrawer(true)}
            className="h-8 w-8 rounded-full bg-[#151515] flex items-center justify-center"
          >
            <CircleQuestionMark size={22} color="#fff" />
          </button>

        </div>
      </div>

      <div className="flex-1 px-6 pb-24 scrollbar-hide">
        {/* Wallet Card Carousel */}
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="mt-5 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cardData.filter(card => card.type !== "flex").map((card) => {
            const isSavings = card.type === "savings";
            const isFlex = card.type === "flex";
            const isStaking = card.type === "staking";
            return (
              <div
                key={card.type}
                className="flex-[0_0_calc(97%-6px)] shrink-0 snap-center min-w-0"
              >
                <div
                  className={`${isSavings
                    ? "bg-transparent border border-[#6da7fd]/50 hover:border-[#86B3F7]/50"
                    : isFlex
                      ? "bg-transparent border border-[#a78bfa]/30 hover:border-[#a78bfa]/50"
                      : "bg-transparent border border-[#C7EF6B]/30 hover:border-[#C7EF6B]/50"
                    } rounded-2xl py-4 min-h-[100px] relative overflow-hidden transition-colors`}
                >

                  <div className={`absolute top-0 right-0 w-32 h-32 ${isSavings ? "bg-white/10" : isFlex ? "bg-[#a78bfa]/5" : "bg-[#C7EF6B]/5"
                    } rounded-full blur-3xl pointer-events-none`}></div>
                  <div className={`absolute bottom-0 left-0 w-24 h-24 ${isSavings ? "bg-[#86B3F7]/10" : isFlex ? "bg-[#a78bfa]/5" : "bg-white/5"
                    } rounded-full blur-2xl pointer-events-none`}></div>

                  {/* Lisar Lines Decoration */}
                  <LisarLines
                    position="top-right"
                    className="opacity-100"
                    width="100px"
                    height="100px"
                  />

                  <LisarLines
                    position="bottom-left"
                    className="opacity-100"
                    width="120px"
                    height="120px"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-0.5">
                      <p className="text-sm text-white/90">{card.title} Balance</p>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="h-5 w-5 flex items-center justify-center"
                      >
                        {showBalance ? (
                          <Eye size={15} color="#fff" />
                        ) : (
                          <EyeOff size={15} color="#fff" />
                        )}
                      </button>
                    </div>
                    {card.isLoading ? (
                      <div className="flex items-baseline justify-center gap-2 mt-2">
                        <span className="text-2xl font-bold text-white">
                          ••••
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-center gap-2 mt-2">
                        <span className="text-xl font-bold text-white/90">
                          {showBalance
                            ? displayBalance
                            : "••••"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="relative z-10 mt-6 flex items-center justify-center gap-4">
                    <button
                      onClick={handleDepositClick}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                        <ArrowDown size={22} className="text-white" />
                      </span>
                      <span className="text-xs font-medium">Deposit</span>
                    </button>

                    <button
                      onClick={() => {
                        if (isSavings) {
                          navigate("/wallet/yields/create-flexible?mode=savings&source=usdc");
                        } else if (isFlex) {
                          navigate("/wallet/yields/create-flexible?mode=flex&source=usdc");
                        } else {
                          navigate("/wallet/yields/create-flexible?mode=staking&source=lpt");
                        }
                      }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                        {isSavings ? <PiggyBank size={22} className="text-white" /> : isFlex ? <PiggyBank size={22} className="text-white" /> : <Sprout size={22} className="text-white" />}
                      </span>
                      <span className="text-xs font-medium">{isSavings ? "Save" : isFlex ? "Flex" : "Grow"}</span>
                    </button>

                    <button
                      onClick={() => setShowEarningsDrawer(true)}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                        <CircleDollarSign size={22} className="text-white" />
                      </span>
                      <span className="text-xs font-medium">Interest</span>
                    </button>

                    <button
                      onClick={() => {
                        handleWithdrawClick();
                      }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                        <ArrowRight size={22} className="text-white" />
                      </span>
                      <span className="text-xs font-medium">Withdraw</span>
                    </button>
                  </div>

                  {isSavings ? (
                    <img
                      src="/highyield-3.svg"
                      alt="Savings"
                      className="absolute bottom-[-20px] right-[-20px] w-20 h-20 object-contain opacity-80"
                    />
                  ) : isFlex ? (
                    <img
                      src="/usdt.svg"
                      alt="Flex"
                      className="absolute bottom-[-12px] right-[-12px] w-14 h-14 object-contain opacity-80"
                    />
                  ) : (
                    <img
                      src="/highyield-1.svg"
                      alt="Growth"
                      className="absolute bottom-[-5px] right-[-5px] w-14 h-14 object-contain opacity-80"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-2">
          {cardData.filter(card => card.type !== "flex").map((card, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === carouselIndex
                ? i === 0 ? "w-6 bg-[#86B3F7]" : "w-6 bg-[#C7EF6B]"
                : "w-1.5 bg-white/30"
                }`}
            />
          ))}
        </div>



        <div className="flex items-center justify-center mt-6 mb-4">
          <div className="h-1 w-8 bg-white/20 rounded-full" />
        </div>

        {/* {renderEarningsCard()} */}

        <div className="my-6">
          <h2 className="text-sm text-white/80 mb-3">Recent transactions</h2>
          <RecentTransactionsCard
            transactions={recentTransactions}
            isLoading={transactionsLoading}
            onTransactionClick={handleTransactionClick}
            skeletonCount={4}
            walletType={walletType}
          />
        </div>
      </div>

      <BottomNavigation currentPath="/wallet" />

      <TransactionDetailsDrawer
        transaction={selectedTransaction}
        isOpen={selectedTransaction !== null}
        onClose={() => setSelectedTransaction(null)}
      />

      <Drawer open={showEarningsDrawer} onOpenChange={setShowEarningsDrawer}>
        <DrawerContent className="bg-[#050505] border-t border-[#1b1b1b]">
          <DrawerHeader>
            <DrawerTitle className="text-base font-medium text-white text-left">
              Interest last 7 days
            </DrawerTitle>
          </DrawerHeader>
          <div className="space-y-3 py-1 max-h-[40vh] overflow-y-auto pr-1 mt-3">
            {sevenDayEarnings.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-[#151515] px-4 py-3 flex justify-between items-center"
              >
                <div>
                  <p className="text-xs text-white/70">Date</p>
                  <p className="text-sm font-semibold text-white">{item.date}</p>
                </div>
                <div>
                  <p className="text-xs text-white/70">Yield</p>
                  <p className="text-sm font-semibold text-[#2fc083]">
                    {item.interest.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    {` ${walletVisual.coinSymbol}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/70">Balance</p>
                  <p className="text-sm font-semibold text-white">
                    {item.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    {` ${walletVisual.coinSymbol}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
      <DepositActionDrawer
        isOpen={showDepositDrawer}
        onClose={() => setShowDepositDrawer(false)}
        onSelectNaira={handleDepositToNaira}
        onSelectCrypto={handleDepositToCrypto}
        walletCoinName={walletVisual.coinName}
        walletIcon={walletVisual.icon}
      />

      <WithdrawActionDrawer
        isOpen={showWithdrawDrawer}
        onClose={() => setShowWithdrawDrawer(false)}
        onSelectNaira={handleWithdrawToNaira}
        onSelectCrypto={handleWithdrawToCrypto}
        walletIcon={walletVisual.icon}
      />

      <Drawer
        open={showWithdrawEmptyDrawer}
        onOpenChange={setShowWithdrawEmptyDrawer}
      >
        <DrawerContent className="bg-[#050505] border-t border-[#1b1b1b]">
          <DrawerHeader>
            <DrawerTitle className="text-base font-medium text-white text-left"></DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-[#C7EF6B]/20 rounded-full my-3 flex items-center justify-center relative overflow-hidden">
                <img
                  src="/ramp.png"
                  alt="Error"
                  className="w-18 h-18 object-cover"
                />
              </div>
            </div>
            <p className="text-sm text-white/80 px-4 text-center">
              Sorry, your wallet balance is empty at the moment! Top up your balance
              to start earning rewards.
            </p>
            <button
              onClick={() => {
                setShowWithdrawEmptyDrawer(false);
                navigate(`/wallet/convert/deposit/${currentWalletType}`);
              }}
              className="w-full h-12 rounded-full bg-[#C7EF6B] text-black text-base font-semibold"
            >
              Top up
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={showTokenInfoDrawer} onOpenChange={setShowTokenInfoDrawer}>
        <DrawerContent className="bg-[#050505] border-t border-[#1b1b1b]">
          <DrawerHeader>
            <div className="flex items-center justify-between w-full">
              <DrawerTitle className="text-base font-medium text-white/90 text-left">
                {walletType === 'savings' ? 'LISAR Savings' : walletType === 'flex' ? 'LISAR Flex' : 'LISAR Growth'}
              </DrawerTitle>
              <button
                onClick={() => {
                  const linkType = walletType === "savings" ? "savings" : walletType === "flex" ? "flex" : "growth";
                  window.open(`/lisar-${linkType}`, "_blank");
                }}
                className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <Info size={16} color="#fff" />
              </button>
            </div>
          </DrawerHeader>
          <div className="space-y-4 py-2 mt-1">
            <div className="rounded-xl bg-[#151515] p-4">
              <p className="text-sm text-white/85">{tokenInfoDescription}</p>
            </div>
            <div className="rounded-xl bg-[#151515] p-4 flex items-center justify-between">
              <p className="text-sm text-white/60">Balance</p>
              <p className="text-sm font-semibold text-white">
                {showBalance ? displayBalance : "••••"}
              </p>
            </div>
            {isStakingWallet && (
              <div className="rounded-xl bg-[#151515] p-4 flex items-center justify-between">
                <p className="text-sm text-white/60">Current orchestrator</p>
                <p className="text-sm font-medium text-white max-w-[60%] text-right truncate">
                  {currentValidatorName || "--"}
                </p>
              </div>
            )}
            <div className="rounded-xl bg-[#151515] p-4 flex items-center justify-between">
              <p className="text-sm text-white/60">Live APY</p>
              <p className="text-sm font-semibold text-[#C7EF6B]">
                {apyLoading && tokenLiveApyPercent === null
                  ? "Loading..."
                  : tokenLiveApyPercent !== null
                    ? `${tokenLiveApyPercent.toFixed(1)}%`
                    : "--"}
              </p>
            </div>
            {earningsCardState === "unbonding" && (
              <div className="rounded-xl bg-[#151515] p-4">
                <p className="text-sm text-white/60">Unbonding in progress</p>
                <p className="text-sm text-white/90 mt-1">
                  {pendingUnbondingData.timeRemaining
                    ? `Your withdrawal will be ready ${pendingUnbondingData.timeRemaining}`
                    : "Your withdrawal is being processed"}
                </p>
              </div>
            )}
            {earningsCardState === "withdraw-ready" && (
              <div className="rounded-xl bg-[#151515] p-4">
                <p className="text-sm text-white/60">Withdrawal ready</p>
                <p className="text-sm text-[#C7EF6B] mt-1 font-semibold">
                  {availableWithdrawalDisplay}
                </p>
                <button
                  onClick={() => {
                    const validatorId = userDelegation?.delegate?.id;
                    navigate(`/unstake/${validatorId}`, {
                      state: { availableBalance: completedUnbondingData.totalAmount },
                    });
                  }}
                  className="mt-3 px-4 py-2 bg-[#C7EF6B] text-black rounded-full text-xs font-semibold"
                >
                  Withdraw Now
                </button>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <SuccessDrawer
        isOpen={showUnlockSuccessDrawer}
        onClose={() => setShowUnlockSuccessDrawer(false)}
        title="Withdrawal successful"
        message="Great, your unlocked LPT tokens has been withdrawn to your wallet."
      />

      <ErrorDrawer
        isOpen={showUnlockErrorDrawer}
        onClose={() => setShowUnlockErrorDrawer(false)}
        title="Withdrawal failed"
        message={unlockErrorMessage}
      />
    </div>
  );
};
