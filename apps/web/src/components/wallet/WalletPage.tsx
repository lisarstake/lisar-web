import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecentTransactionsCard } from "../transactions/RecentTransactionsCard";
import { TransactionDetailsDrawer } from "../transactions/TransactionDetailsDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { PortfolioSelectionDrawer } from "@/components/general/PortfolioSelectionDrawer";
import { SuccessDrawer } from "@/components/general/SuccessDrawer";
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
import { getEarliestUnbondingTime } from "@/lib/unbondingTime";
import { getOrchestratorDisplayName } from "@/lib/orchestrators";
import { TransactionData } from "@/services/transactions/types";
import { delegationService } from "@/services";
import { YIELD_ASSET_PICKER_PATH } from "@/lib/yieldPaths";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CircleQuestionMark,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";

interface WalletPageProps {
  walletType?: string;
}

type EarningsCardState = "default" | "empty" | "unbonding" | "withdraw-ready";
type TransferMode = "deposit" | "withdraw" | "withdraw-unlocked";
type FundingOption = {
  id: "ngn" | "crypto";
  label: string;
  icon: string;
  subtitle: string;
  balance: string;
  availableBalance: number | null;
  enabled: boolean;
};

const WALLET_VISUALS = {
  savings: {
    coinName: "USDC",
    coinSymbol: "USDC",
    icon: "/usdc.svg",
    cardGradient:
      "bg-[linear-gradient(155deg,#0096FF_0%,#34AEFF_50%,#8DD4FF_100%)] border-[#8DD4FF]/65",
  },
  staking: {
    coinName: "Livepeer",
    coinSymbol: "LPT",
    icon: "/livepeer.webp",
    cardGradient:
      "bg-[linear-gradient(155deg,#006400_0%,#8DD4FF_180%)] border-[#006400]/65",
  },
} as const;

export const WalletPage: React.FC<WalletPageProps> = ({ walletType }) => {
  const navigate = useNavigate();
  const currentWalletType = walletType === "staking" ? "staking" : "savings";
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState(false);
  const [showTopUpDrawer, setShowTopUpDrawer] = useState(false);
  const [topUpDrawerView, setTopUpDrawerView] = useState<"options" | "empty">(
    "options",
  );
  const [emptyFundingAsset, setEmptyFundingAsset] = useState("wallet");
  const [transferMode, setTransferMode] = useState<TransferMode | null>(null);
  const [showWithdrawEmptyDrawer, setShowWithdrawEmptyDrawer] = useState(false);
  const [showEarningsDrawer, setShowEarningsDrawer] = useState(false);
  const [showTokenInfoDrawer, setShowTokenInfoDrawer] = useState(false);
  const [showUnlockSuccessDrawer, setShowUnlockSuccessDrawer] = useState(false);
  const [showUnlockErrorDrawer, setShowUnlockErrorDrawer] = useState(false);
  const [unlockErrorMessage, setUnlockErrorMessage] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionData | null>(null);

  const {
    nairaBalance,
    highyieldBalance,
    stablesBalance,
    solanaUsdcBalance,
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

  const isStakingWallet = walletType === "staking";
  const stakedBalance = parseFloat(delegatorStakeProfile?.currentStake || "0");
  const ngnBalance = nairaBalance ?? 0;
  const idleUsdcBalance = solanaUsdcBalance ?? 0;
  const idleLptBalance = highyieldBalance ?? 0;
  const idleCryptoOptionBalance = isStakingWallet
    ? idleLptBalance
    : idleUsdcBalance;
  const activeWalletCard = useMemo(() => {
    if (walletType === "staking") {
      return cardData.find((item) => item.type === "staking") ?? null;
    }
    return cardData.find((item) => item.type === "savings") ?? null;
  }, [cardData, walletType]);
  const walletVisual = isStakingWallet
    ? WALLET_VISUALS.staking
    : WALLET_VISUALS.savings;
  const assetBalance = activeWalletCard?.balance ?? 0;
  const formattedAssetBalance = `${assetBalance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  })} ${walletVisual.coinSymbol}`;
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

  const totalStakingBalance = (highyieldBalance || 0) + stakedBalance;
  const withdrawableWalletBalance =
    walletType === "staking" ? stakedBalance : stablesBalance || 0;
  const zeroBalance =
    walletType === "staking"
      ? totalStakingBalance <= 0
      : (stablesBalance || 0) <= 0;
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
        if (walletType === "savings") {
          return savingsTxTypes.includes(tx.transaction_type) && !isLpt;
        }
        if (walletType === "staking") {
          return stakingTxTypes.includes(tx.transaction_type) && isLpt;
        }
        return false;
      })
      .slice(0, 5);
  }, [transactions, walletType]);

  const fundingOptions = useMemo<FundingOption[]>(
    () => [
      {
        id: "ngn",
        label: "NGN",
        icon: "/ng_flag.png",
        subtitle: "Naira balance",
        balance: `₦${ngnBalance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        availableBalance: ngnBalance,
        enabled: false,
      },
      {
        id: "crypto",
        label: walletVisual.coinSymbol,
        icon: walletVisual.icon,
        subtitle: `${walletVisual.coinName} balance`,
        balance: `${idleCryptoOptionBalance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${walletVisual.coinSymbol}`,
        availableBalance: idleCryptoOptionBalance,
        enabled: true,
      },
    ],
    [
      idleCryptoOptionBalance,
      ngnBalance,
      walletVisual.coinName,
      walletVisual.coinSymbol,
      walletVisual.icon,
    ],
  );

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDepositClick = () => {
    setTransferMode("deposit");
    setShowTopUpDrawer(true);
  };

  const handleWithdrawToCryptoBalance = () => {
    if (walletType === "savings") {
      if (!stablesBalance || stablesBalance <= 0) {
        setShowWithdrawEmptyDrawer(true);
        return;
      }
      navigate("/redeem", {
        state: {
          entry: {
            id: "perena-wallet",
            name: "Perena USD Plus",
            yourStake: stablesBalance || 0,
            isSavings: true,
          },
        },
      });
      return;
    }

    if (stakedBalance <= 0) {
      setShowWithdrawEmptyDrawer(true);
      return;
    }

    const validatorId = userDelegation?.delegate?.id;

    navigate(`/unstake/${validatorId}`, {
      state: { availableBalance: stakedBalance },
    });
  };

  const handleWithdrawClick = () => {
    if (withdrawableWalletBalance <= 0) {
      setShowWithdrawEmptyDrawer(true);
      return;
    }
    setTransferMode("withdraw");
    setShowTopUpDrawer(true);
  };

  const openNairaConvertPage = (mode: TransferMode) => {
    setShowTopUpDrawer(false);
    navigate(`/wallet/convert/${mode}/${currentWalletType}`);
  };

  const handleTransferOptionSelect = (asset: "naira" | "crypto") => {
    if (!transferMode) return;

    if (transferMode === "withdraw-unlocked") {
      if (!unlockedUnbondingLockId || completedUnbondingData.totalAmount <= 0) {
        setUnlockErrorMessage("No unlocked stake available for withdrawal.");
        setShowUnlockErrorDrawer(true);
        setShowTopUpDrawer(false);
        return;
      }

      if (asset === "naira") {
        setShowTopUpDrawer(false);
        navigate(`/wallet/unlocked-withdraw/${currentWalletType}`, {
          state: {
            unlockedAmount: completedUnbondingData.totalAmount,
            unbondingLockId: unlockedUnbondingLockId,
          },
        });
        return;
      }

      const run = async () => {
        setShowTopUpDrawer(false);
        try {
          if (!state.user?.wallet_id || !state.user?.wallet_address) {
            throw new Error("Wallet information is missing.");
          }

          const response = await delegationService.withdrawStake({
            walletId: state.user.wallet_id,
            walletAddress: state.user.wallet_address,
            unbondingLockId: unlockedUnbondingLockId,
          });

          if (!response.success) {
            throw new Error(response.message || "Failed to withdraw unlocked stake.");
          }

          await Promise.all([refreshAllWalletData(), refetchDelegation()]);
          setShowUnlockSuccessDrawer(true);
        } catch (error: any) {
          setUnlockErrorMessage(
            error?.message || "Unable to complete withdrawal right now.",
          );
          setShowUnlockErrorDrawer(true);
        } finally {
        }
      };

      void run();
      return;
    }

    if (transferMode === "deposit") {
      if (asset === "naira") {
        openNairaConvertPage("deposit");
      } else {
        setShowTopUpDrawer(false);
        if (currentWalletType === "savings") {
          navigate("/wallet/yields/create-flexible?mode=savings&source=usdc");
        } else {
          navigate("/wallet/yields/create-flexible?mode=staking&source=lpt");
        }
      }
      return;
    }

    if (asset === "naira") {
      openNairaConvertPage("withdraw");
    } else {
      setShowTopUpDrawer(false);
      handleWithdrawToCryptoBalance();
    }
  };

  const handleFundingOptionSelect = (assetId: FundingOption["id"]) => {
    const option = fundingOptions.find((item) => item.id === assetId);
    if (!option || !option.enabled) return;

    const isWithdrawFlow =
      transferMode === "withdraw" || transferMode === "withdraw-unlocked";

    if (!isWithdrawFlow && (option.availableBalance || 0) <= 0) {
      setEmptyFundingAsset(option.label);
      setTopUpDrawerView("empty");
      return;
    }

    setTopUpDrawerView("options");
    if (assetId === "ngn") {
      handleTransferOptionSelect("naira");
    } else {
      handleTransferOptionSelect("crypto");
    }
  };

  const handleTransactionClick = (transaction: TransactionData) => {
    setSelectedTransaction(transaction);
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

  const renderEarningsCard = () => {
    if (earningsCardState === "default" && activeWalletCard) {
      return (
        <div className="mt-4 rounded-md p-3 bg-[#13170a] relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <img
                src="/yield.png"
                alt="Weekly earnings"
                className="w-10 h-10 object-cover rounded-lg object-top"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-[14px] font-medium">
                You've earned{" "} <span className="text-green-400">
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
                </span>
                this week!
              </h3>
              <p className="text-white/60 text-[13px]">
                Increase your holdings to earn more
              </p>
            </div>
          </div>

        </div>
      );
    }

    if (earningsCardState === "withdraw-ready") {
      return (
        <div className="mt-4 rounded-md p-3 bg-[#13170a] relative">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <img
                src="/livepeer.webp"
                alt="Stake unlocked"
                className="w-9 h-9 object-cover rounded-full"
              />
            </div>
            <div className="flex-1">

              <p className="text-white/90 text-[13px]">
                You have {completedUnbondingData.totalAmount.toFixed(2)} LPT available fro
                withdrawal
              </p>
              <button onClick={() => {
                setTransferMode("withdraw-unlocked");
                setShowTopUpDrawer(true);
              }} className="mt-3 px-4 py-2 bg-[#C7EF6B] text-black rounded-full text-xs font-semibold hover:bg-[#B8E55A] transition-colors relative z-10">
                withdraw
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (earningsCardState === "unbonding") {
      return (
        <div className="mt-4 rounded-md p-3 bg-[#13170a] relative">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <img
                src="/livepeer.webp"
                alt="Unbonding in progress"
                className="w-9 h-9 object-cover rounded-full"
              />
            </div>
            <div className="flex-1">

              <p className="text-white/90 text-[13px]">
                {pendingUnbondingData.timeRemaining
                  ? ` You have a withdrawal in process, ${pendingUnbondingData.timeRemaining}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

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
            onClick={() => setShowTokenInfoDrawer(true)}
            className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
          >
            <CircleQuestionMark size={22} color="#fff" />
          </button>

        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
        <div className="mt-5">
          <div
            className={`${isStakingWallet
              ? "bg-transparent border-2 border-[#C7EF6B]/30 hover:border-[#C7EF6B]/50"
              : "bg-[#6da7fd] border-2 border-[#86B3F7]/30 hover:border-[#86B3F7]/50"
              } rounded-2xl p-5 relative overflow-hidden transition-colors min-h-[190px]`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <p
                    className={`text-sm ${isStakingWallet ? "text-white/80" : "text-white/90"
                      }`}
                  >
                    Wallet balance
                  </p>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    {showBalance ? (
                      <Eye
                        size={18}
                        color={
                          isStakingWallet
                            ? "rgba(199, 239, 107, 0.8)"
                            : "rgba(255, 255, 255, 0.8)"
                        }
                      />
                    ) : (
                      <EyeOff
                        size={18}
                        color={
                          isStakingWallet
                            ? "rgba(199, 239, 107, 0.8)"
                            : "rgba(255, 255, 255, 0.8)"
                        }
                      />
                    )}
                  </button>
                </div>
              </div>

              {activeWalletCard?.isLoading ? (
                <div className="mt-1">{renderLoadingStars("text-xl font-semibold")}</div>
              ) : (
                <p className="mt-1 text-xl font-medium tracking-tight text-white">
                  {showBalance ? formattedAssetBalance : "★★★★"}
                </p>
              )}

              <div className="mt-7 flex items-center justify-center gap-6">
                <button
                  onClick={handleDepositClick}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13170a]">
                    <ArrowDown size={22} className="text-[#e8ece9]" />
                  </span>
                  <span className="text-xs font-medium">Deposit</span>
                </button>

                <button
                  onClick={handleWithdrawClick}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13170a]">
                    <ArrowRight size={22} className="text-[#e8ece9]" />
                  </span>
                  <span className="text-xs font-medium">Withdraw</span>
                </button>

                <button
                  onClick={() => setShowEarningsDrawer(true)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13170a]">
                    <DollarSign size={22} className="text-[#e8ece9]" />
                  </span>
                  <span className="text-xs font-medium">Earnings</span>
                </button>
              </div>
            </div>
          </div>
        </div>



        <div className="flex items-center justify-center mt-6 mb-4">
          <div className="h-1 w-8 bg-white/20 rounded-full" />
        </div>

        {renderEarningsCard()}

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
        <DrawerContent className="bg-[#050505] border-[#2a2a2a]">
          <DrawerHeader>
            <DrawerTitle className="text-base font-medium text-white text-left">
              Earned last 7 days
            </DrawerTitle>
          </DrawerHeader>
          <div className="space-y-3 py-1 max-h-[40vh] overflow-y-auto pr-1 mt-3">
            {sevenDayEarnings.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-[#13170a] px-4 py-3 flex justify-between items-center"
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



      <Drawer
        open={showTopUpDrawer}
        onOpenChange={(open) => {
          setShowTopUpDrawer(open);
          if (!open) {
            setTransferMode(null);
            setTopUpDrawerView("options");
          }
        }}
      >
        <DrawerContent className="bg-[#050505] border-[#2a2a2a]">
          <DrawerHeader>
            <DrawerTitle className="text-base font-medium text-white text-left">
              {topUpDrawerView === "options"
                ? transferMode === "deposit"
                  ? "Deposit From"
                  : transferMode === "withdraw" ||
                    transferMode === "withdraw-unlocked"
                    ? "Withdraw To"
                    : "Withdraw To"
                : ""}
            </DrawerTitle>
          </DrawerHeader>
          {topUpDrawerView === "options" ? (
            <div className="space-y-3 py-2">
              {fundingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleFundingOptionSelect(option.id)}
                  disabled={!option.enabled}
                  className={`w-full rounded-xl px-4 py-3 text-left ${option.enabled ? "bg-[#13170a]" : "bg-[#13170a] opacity-60"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={option.icon}
                        alt={option.label}
                        className={`h-8 w-8 object-cover ${option.id === "crypto" ? "rounded-full" : ""
                          }`}
                      />
                      <div>
                        <p className="text-base font-medium text-white">
                          {option.id === "ngn" && transferMode === "withdraw"
                            ? "Naira balance"
                            : option.id === "crypto" &&
                              transferMode === "withdraw"
                              ? option.label
                              : option.label}
                        </p>
                        <p className="text-sm text-white/60">
                          {option.id === "ngn" && transferMode === "deposit"
                            ? `Naira balance`
                            : option.id === "ngn" &&
                              transferMode === "withdraw"
                              ? `Naira balance`
                              : option.id === "crypto" &&
                                transferMode === "deposit"
                                ? option.subtitle
                                : option.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-white/80">{option.balance}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
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
                Sorry, your {emptyFundingAsset} balance is empty at the moment!
                Please top up your wallet to proceed.
              </p>
              <button
                onClick={() => {
                  setShowTopUpDrawer(false);
                  setTopUpDrawerView("options");
                  navigate(`/wallet/convert/deposit/${currentWalletType}`);
                }}
                className="w-full h-12 rounded-full bg-[#C7EF6B] text-black text-base font-semibold"
              >
                Deposit
              </button>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <Drawer
        open={showWithdrawEmptyDrawer}
        onOpenChange={setShowWithdrawEmptyDrawer}
      >
        <DrawerContent className="bg-[#050505] border border-[#2a2a2a]">
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
        <DrawerContent className="bg-[#050505] border-[#2a2a2a]">
          <DrawerHeader>
            <DrawerTitle className="text-base font-medium text-white text-left">
              {walletVisual.coinName} token
            </DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 py-2 mt-1">
            <div className="rounded-xl bg-[#13170a] p-4">
              <p className="text-sm text-white/85">{tokenInfoDescription}</p>
            </div>
            {isStakingWallet && (
              <div className="rounded-xl bg-[#13170a] p-4 flex items-center justify-between">
                <p className="text-sm text-white/60">Current orchestrator</p>
                <p className="text-sm font-medium text-white max-w-[60%] text-right truncate">
                  {currentValidatorName || "--"}
                </p>
              </div>
            )}
            <div className="rounded-xl bg-[#13170a] p-4 flex items-center justify-between">
              <p className="text-sm text-white/60">Live APY</p>
              <p className="text-sm font-semibold text-[#C7EF6B]">
                {apyLoading && tokenLiveApyPercent === null
                  ? "Loading..."
                  : tokenLiveApyPercent !== null
                    ? `${tokenLiveApyPercent.toFixed(1)}%`
                    : "--"}
              </p>
            </div>
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
