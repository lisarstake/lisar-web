import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WalletActionButtons } from "./WalletActionButtons";
import { RecentTransactionsCard } from "./RecentTransactionsCard";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useGuidedTour } from "@/hooks/useGuidedTour";
import { usePrices } from "@/hooks/usePrices";
import { WALLET_TOUR_ID } from "@/lib/tourConfig";
import { priceService } from "@/lib/priceService";
import { formatEarnings } from "@/lib/formatters";
import { TransactionData } from "@/services/transactions/types";
import {
  CircleQuestionMark,
  ChevronLeft,
  Eye,
  EyeOff,
  ArrowRight,
  TvMinimalPlay,
} from "lucide-react";

interface WalletPageProps {
  walletType?: string;
}

export const WalletPage: React.FC<WalletPageProps> = ({ walletType }) => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("wallet_show_balance");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("wallet_show_balance", JSON.stringify(showBalance));
  }, [showBalance]);
  const { state } = useAuth();
  const {
    wallet,
    isLoading: walletLoading,
    solanaBalance,
    ethereumBalance,
    solanaLoading,
    ethereumLoading,
  } = useWallet();
  const { isLoading: delegationLoading } = useDelegation();
  useNotification();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { prices } = usePrices();

  // Start tour for non-onboarded users
  const shouldAutoStart = useMemo(() => {
    return state.user?.is_onboarded === false && !state.isLoading;
  }, [state.user?.is_onboarded, state.isLoading]);

  const { isCompleted: isTourCompleted, startTour } = useGuidedTour({
    tourId: WALLET_TOUR_ID,
    autoStart: shouldAutoStart,
  });

  const rawBalance = useMemo(() => {
    if (walletType === "savings") {
      return solanaBalance ?? 0;
    }
    if (walletType === "staking") {
      return ethereumBalance ?? 0;
    }
    return 0;
  }, [walletType, solanaBalance, ethereumBalance]);

  const fiatSymbol = useMemo(() => {
    const fiatCurrency = wallet?.fiatCurrency || state.user?.fiat_type || "USD";
    return priceService.getCurrencySymbol(fiatCurrency);
  }, [wallet?.fiatCurrency, state.user?.fiat_type]);

  const currentWalletBalance = useMemo(() => {
    return rawBalance;
  }, [rawBalance]);

  const currentWalletFiatValue = useMemo(() => {
    const fiatCurrency = (state.user?.fiat_type || "USD").toUpperCase();

    // Staking (High Yield) - LPT based
    if (walletType === "staking") {
      const lptPriceInUsd = prices.lpt || 0;
      const usdValue = rawBalance * lptPriceInUsd;

      switch (fiatCurrency) {
        case "NGN":
          return usdValue * prices.ngn;
        case "EUR":
          return usdValue * prices.eur;
        case "GBP":
          return usdValue * prices.gbp;
        default:
          return usdValue;
      }
    }

    // Savings (Stables) - already USD-equivalent stable coins
    if (walletType === "savings") {
      const stableBalance = rawBalance;

      switch (fiatCurrency) {
        case "NGN":
          return stableBalance * prices.ngn;
        case "EUR":
          return stableBalance * prices.eur;
        case "GBP":
          return stableBalance * prices.gbp;
        default:
          return stableBalance;
      }
    }

    return 0;
  }, [walletType, rawBalance, prices, state.user?.fiat_type]);

  const currentWalletTitle = useMemo(() => {
    if (walletType === "staking") {
      return "Staking";
    } else if (walletType === "savings") {
      return "Savings";
    }
    return "Total Balance";
  }, [walletType]);

  const handleStakeClick = () => {
    if (walletType === "savings") {
      navigate("/stable-tiers", { state: { walletType } });
    } else {
      navigate("/savings-tiers");
    }
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleDepositClick = () => {
    if (walletType === "savings") {
      navigate("/stable-tiers", { state: { walletType, action: "deposit" } });
    } else {
      navigate(`/deposit`, { state: { walletType } });
    }
  };

  const handlePortfolioClick = () => {
    navigate("/portfolio", { state: { walletType } });
  };

  const handleWithdrawClick = () => {
    if (walletType === "savings") {
      navigate("/stable-tiers", { state: { walletType, action: "withdraw" } });
    } else {
      navigate("/withdraw", { state: { walletType } });
    }
  };

  const handleBackClick = () => {
    navigate(-1);
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

  const handleAcademyClick = () => {
    navigate("/learn");
  };

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
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>

        {/* <h1 className="text-lg font-medium text-white">
          {walletType === "staking" ? "High Yield Wallet" : "Stables Wallet"}
        </h1> */}

        <h1 className="text-lg font-medium text-white">Wallet</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={handleHelpClick}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#86B3F7" size={16} />
          </button>
        </div>
      </div>

      {/* Wallet Card */}
      {walletType && (
        <div className="px-6 pb-6">
          <div
            className={`${
              walletType === "savings"
                ? "bg-[#6da7fd] border-2 border-[#86B3F7]/30 hover:border-[#86B3F7]/50"
                : "bg-transparent border-2 border-[#C7EF6B]/30 hover:border-[#C7EF6B]/50"
            } rounded-2xl p-5 relative overflow-hidden transition-colors h-[170px]`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-white/90 text-sm font-medium">
                    {currentWalletTitle} Wallet
                  </h3>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    {showBalance ? (
                      <Eye
                        size={18}
                        color={
                          walletType === "savings"
                            ? "rgba(255, 255, 255, 0.8)"
                            : "rgba(199, 239, 107, 0.8)"
                        }
                      />
                    ) : (
                      <EyeOff
                        size={18}
                        color={
                          walletType === "savings"
                            ? "rgba(255, 255, 255, 0.8)"
                            : "rgba(199, 239, 107, 0.8)"
                        }
                      />
                    )}
                  </button>
                </div>

                {/* Balance Display */}
                <div className="mb-4 min-h-[60px]">
                  {walletLoading ||
                  delegationLoading ||
                  (walletType === "savings"
                    ? solanaLoading
                    : ethereumLoading) ? (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-bold text-white">
                        ••••
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl font-bold text-white">
                          {showBalance
                            ? formatEarnings(currentWalletBalance)
                            : "••••"}
                        </span>
                        {showBalance && (
                          <span
                            className={`text-sm ml-[-5px] ${
                              walletType === "savings"
                                ? "text-white/90"
                                : "text-white/70"
                            }`}
                          >
                            {walletType === "savings" ? "USDC" : "LPT"}
                          </span>
                        )}
                      </div>
                      <div className="min-h-[20px]">
                        {showBalance && (
                          <p
                            className={`text-sm ${
                              walletType === "savings"
                                ? "text-white/90"
                                : "text-white/60"
                            }`}
                          >
                            ≈{fiatSymbol}
                            {currentWalletFiatValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Left Text */}
            <div className="absolute bottom-2 left-2 z-10">
              <span className="text-white/70 text-[10px] bg-[#2a2a2a] rounded-full px-3 py-1 inline-block  leading-relaxed">
                {` Interest will be accrued daily ${walletType === "savings" ? "up to 14%" : "up to 60%"} per annum`}
              </span>
            </div>

            {/* Bottom Right Image */}
            {walletType === "savings" ? (
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
      <div className="flex-1 px-6 pb-20 pt-6 overflow-y-auto">
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

      {/* Floating Academy Button */}
      <button
        onClick={handleAcademyClick}
        className="fixed bottom-28 right-8 flex flex-col items-center justify-center bg-[#2a2a2a] rounded-full gap-2 h-14 w-14 text-white/70 hover:text-white transition-colors z-20"
        aria-label="Watch video guides"
      >
        <TvMinimalPlay size={24} />
     
      </button>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/wallet" />

      {/* Balance Information Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title={
          walletType === "savings"
            ? "About Stables Wallet"
            : "About High Yield Wallet"
        }
        content={
          walletType === "savings"
            ? [
                "Stables offers lower yields with instant withdrawal capabilities.",
                "Your funds are available for withdrawal at any time without waiting periods.",
                "Perfect for emergency funds and short-term savings with stable returns.",
                "Interest is accrued daily and paid out monthly at 14% APY.",
              ]
            : [
                "High Yield offers higher APYs for maximum returns on your investment.",
                "Withdrawals are subject to a 7-day unbonding period before funds become available.",
                "The value may be volatile, so this is best for long-term growth strategies.",
                "Interest is accrued daily and paid out monthly at 62% APY.",
              ]
        }
      />
    </div>
  );
};
