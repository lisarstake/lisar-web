import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecentTransactionsCard } from "../transactions/RecentTransactionsCard";
import { TransactionDetailsDrawer } from "../transactions/TransactionDetailsDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { EarningsBreakdownDrawer } from "../general/EarningsBreakdownDrawer";
import { PortfolioSelectionDrawer } from "@/components/general/PortfolioSelectionDrawer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useWalletCard, WalletCardData } from "@/contexts/WalletCardContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { formatEarnings } from "@/lib/formatters";
import { getEarliestUnbondingTime } from "@/lib/unbondingTime";
import { TransactionData } from "@/services/transactions/types";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  RotateCcw,
  SquareKanban,
} from "lucide-react";

interface WalletPageProps {
  walletType?: string;
}

type FundingOption = {
  id: string;
  label: string;
  icon: string;
  subtitle: string;
  balance: string;
  availableBalance: number | null;
  enabled: boolean;
};

type EarningsCardState = "default" | "empty" | "unbonding" | "withdraw-ready";

export const WalletPage: React.FC<WalletPageProps> = ({ walletType }) => {
  const navigate = useNavigate();
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState(false);
  const [showTopUpDrawer, setShowTopUpDrawer] = useState(false);
  const [topUpDrawerView, setTopUpDrawerView] = useState<"options" | "empty">(
    "options",
  );
  const [emptyFundingAsset, setEmptyFundingAsset] = useState("wallet");
  const [showWithdrawEmptyDrawer, setShowWithdrawEmptyDrawer] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionData | null>(null);
  const [selectedEarningsCard, setSelectedEarningsCard] =
    useState<WalletCardData | null>(null);

  const { state } = useAuth();
  const {
    solanaUsdcBalance,
    solanaUsdtBalance,
    highyieldBalance,
    stablesBalance,
  } = useWallet();
  const { delegatorStakeProfile, userDelegation, delegatorTransactions } =
    useDelegation();
  const {
    cardData,
    displayCurrency,
    showBalance,
    setShowBalance,
    displayFiatSymbol,
  } = useWalletCard();
  const { transactions, isLoading: transactionsLoading } = useTransactions();

  const isStakingWallet = walletType === "staking";
  const stakedBalance = parseFloat(delegatorStakeProfile?.currentStake || "0");
  const ngnBalance =
    (state.user?.fiat_type || "NGN").toUpperCase() === "NGN"
      ? Number(state.user?.fiat_balance || 0)
      : 0;

  const activeWalletCard = useMemo(() => {
    if (walletType === "staking") {
      return cardData.find((item) => item.type === "staking") ?? null;
    }
    return cardData.find((item) => item.type === "savings") ?? null;
  }, [cardData, walletType]);

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

  const totalStakingBalance = (highyieldBalance || 0) + stakedBalance;
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

  const fundingOptions = useMemo<FundingOption[]>(() => {
    if (walletType === "staking") {
      return [
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
          enabled: true,
        },
        {
          id: "usd",
          label: "USD",
          icon: "/us_flag.png",
          subtitle: "Dollar balance",
          balance: "Coming soon",
          availableBalance: null,
          enabled: false,
        },
        {
          id: "lpt",
          label: "LPT",
          icon: "/livepeer.webp",
          subtitle: "Livepeer",
          balance: `${(highyieldBalance || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })} LPT`,
          availableBalance: highyieldBalance || 0,
          enabled: true,
        },
      ];
    }

    return [
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
        enabled: true,
      },
      {
        id: "usd",
        label: "USD",
        icon: "/us_flag.png",
        subtitle: "Dollar balance",
        balance: "Coming soon",
        availableBalance: null,
        enabled: false,
      },
      {
        id: "usdc",
        label: "USDC",
        icon: "/usdc.svg",
        subtitle: "USD Coin",
        balance: `${(solanaUsdcBalance || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })} USDC`,
        availableBalance: solanaUsdcBalance || 0,
        enabled: true,
      },
      {
        id: "usdt",
        label: "USDT",
        icon: "/usdt.svg",
        subtitle: "Tether USD",
        balance: `${(solanaUsdtBalance || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })} USDT`,
        availableBalance: solanaUsdtBalance || 0,
        enabled: true,
      },
    ];
  }, [
    walletType,
    ngnBalance,
    highyieldBalance,
    solanaUsdcBalance,
    solanaUsdtBalance,
  ]);

  const handleBackClick = () => {
    navigate("/wallet");
  };

  const handleDepositClick = () => {
    setTopUpDrawerView("options");
    setShowTopUpDrawer(true);
  };

  const handleWithdrawClick = () => {
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

  const handlePortfolioClick = () => {
    const card =
      cardData.find((item) => item.type === walletType) ??
      cardData.find((item) => item.type === "savings") ??
      null;
    setSelectedEarningsCard(card);
  };

  const handleFundingOptionSelect = (assetId: string) => {
    const option = fundingOptions.find((item) => item.id === assetId);
    if (!option || !option.enabled) return;

    if ((option.availableBalance || 0) <= 0) {
      setEmptyFundingAsset(option.label);
      setTopUpDrawerView("empty");
      return;
    }

    setShowTopUpDrawer(false);
    setTopUpDrawerView("options");
    const mode = walletType === "staking" ? "staking" : "savings";
    navigate(`/wallet/savings/create-flexible?mode=${mode}&source=${assetId}`);
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
        <div
          className="mt-2 rounded-xl p-3 bg-[#13170a] relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <img
                src="/crypto.png"
                alt="Weekly earnings"
                className="w-14 h-14 object-cover rounded-lg"
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
                Keep saving to earn more rewards
              </p>
            </div>
          </div>

        </div>
      );
    }

    if (earningsCardState === "withdraw-ready") {
      return (
        <div className="mt-2 rounded-xl p-3 bg-[#13170a] relative">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <img
                src="/livepeer.webp"
                alt="Stake unlocked"
                className="w-14 h-14 object-cover rounded-full"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-[14px] font-medium">
                stake unlocked
              </h3>
              <p className="text-white/60 text-[13px]">
                You have {completedUnbondingData.totalAmount.toFixed(2)} LPT ready to
                withdraw
              </p>
              <button onClick={() => {
                if (completedUnbondingData.validatorId) {
                  navigate(
                    `/validator-details/${completedUnbondingData.validatorId}`,
                  );
                }
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
        <div className="mt-2 rounded-xl p-3 bg-[#13170a] relative">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <img
                src="/livepeer.webp"
                alt="Unbonding in progress"
                className="w-14 h-14 object-cover rounded-full"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-[14px] font-medium">
                Withdrawal processing
              </h3>
              <p className="text-white/60 text-[13px]">
                {pendingUnbondingData.timeRemaining
                  ? ` You have a withdrawal in process, ${pendingUnbondingData.timeRemaining}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mt-2 rounded-xl p-3 bg-[#13170a] relative">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <img
              src="/crypto.png"
              alt="Start earning"
              className="w-14 h-14 object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-white text-[14px] font-medium">Start earning</h3>
            <p className="text-white/60 text-[13px]">
              Top up your balance to start earning rewards daily!
            </p>
            <button
              onClick={handleDepositClick}
              className="px-4 py-2 bg-[#C7EF6B] text-black rounded-full text-xs font-semibold hover:bg-[#B8E55A] transition-colors"
            >
              Top up
            </button>
          </div>
        </div>
      </div>
    );
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
        <div className="mt-10 text-center">
          <p className="text-sm text-white/50">Wallet balance</p>
          {activeWalletCard?.isLoading ? (
            <div className="mt-2">{renderLoadingStars("text-lg font-semibold")}</div>
          ) : (
            <p className="mt-2 text-2xl font-bold text-white/90">
              {showBalance
                ? isStakingWallet
                  ? `${formatEarnings(stakedBalance)} LPT`
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
            onClick={handleDepositClick}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13170a]">
              <ArrowDown size={24} className="text-[#e8ece9]" />
            </span>
            <span className="text-xs font-medium">Top up</span>
          </button>

          <button
            onClick={handleWithdrawClick}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#13170a]">
              <ArrowRight size={24} className="text-[#e8ece9]" />
            </span>
            <span className="text-xs font-medium">Withdraw</span>
          </button>

          <button
            onClick={handlePortfolioClick}
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

        {renderEarningsCard()}

        <div className="mt-8">
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

      <EarningsBreakdownDrawer
        isOpen={selectedEarningsCard !== null}
        onClose={() => setSelectedEarningsCard(null)}
        balance={selectedEarningsCard?.displayBalanceValue || 0}
        apyPercent={selectedEarningsCard?.apyPercent || 0}
        displayCurrency={displayCurrency}
        displayFiatSymbol={displayFiatSymbol}
        cardType={selectedEarningsCard?.type}
      />

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
            if (stakedBalance > 0) {
              navigate("/wallet/staking");
            } else {
              navigate("/wallet/savings/create-plan");
            }
          }
        }}
      />

      <Drawer
        open={showTopUpDrawer}
        onOpenChange={(open) => {
          setShowTopUpDrawer(open);
          if (!open) setTopUpDrawerView("options");
        }}
      >
        <DrawerContent className="bg-[#050505] border-[#2a2a2a]">
          <DrawerHeader>
            <DrawerTitle className="text-base font-medium text-white text-left">
              {topUpDrawerView === "options" ? "Top Up From" : ""}
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
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-base font-medium text-white">
                          {option.label}
                        </p>
                        <p className="text-sm text-white/60">{option.subtitle}</p>
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
                Sorry, your {emptyFundingAsset} balance is empty at the moment! Please top up your wallet to proceed.
              </p>
              <button
                onClick={() => {
                  setShowTopUpDrawer(false);
                  setTopUpDrawerView("options");
                  navigate("/wallet?open=deposit");
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
            <DrawerTitle className="text-base font-medium text-white text-left">

            </DrawerTitle>
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
              Sorry, your wallet balance is empty at the moment! Top up your balance to start
              earning rewards.
            </p>
            <button
              onClick={() => {
                setShowWithdrawEmptyDrawer(false);
                navigate("/wallet?open=deposit");
              }}
              className="w-full h-12 rounded-full bg-[#C7EF6B] text-black text-base font-semibold"
            >
              Top up
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
