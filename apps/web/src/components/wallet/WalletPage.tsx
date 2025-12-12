import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OrchestratorList } from "../validator/OrchestratorList";
import { WalletActionButtons } from "./WalletActionButtons";
import { RecentTransactionsCard } from "./RecentTransactionsCard";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { LisarLines } from "@/components/general/lisar-lines";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useGuidedTour } from "@/hooks/useGuidedTour";
import { WALLET_TOUR_ID } from "@/lib/tourConfig";
import { priceService } from "@/lib/priceService";
import { formatEarnings } from "@/lib/formatters";
import { TransactionData } from "@/services/transactions/types";
import { walletService } from "@/services";
import {
  Search,
  Bell,
  CircleQuestionMark,
  ChevronLeft,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";

interface WalletPageProps {
  walletType?: string;
}

export const WalletPage: React.FC<WalletPageProps> = ({ walletType }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showBalanceDrawer, setShowBalanceDrawer] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("wallet_show_balance");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("wallet_show_balance", JSON.stringify(showBalance));
  }, [showBalance]);
  const { orchestrators, isLoading, error, refetch } = useOrchestrators();
  const { state } = useAuth();
  const { wallet, isLoading: walletLoading } = useWallet();
  const {
    delegatorStakeProfile,
    delegatorTransactions,
    isLoading: delegationLoading,
  } = useDelegation();
  const { unreadCount } = useNotification();
  const { transactions, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useTransactions();

  // Start tour for non-onboarded users
  const shouldAutoStart = useMemo(() => {
    return state.user?.is_onboarded === false && !state.isLoading;
  }, [state.user?.is_onboarded, state.isLoading]);

  const { isCompleted: isTourCompleted, startTour } = useGuidedTour({
    tourId: WALLET_TOUR_ID,
    autoStart: shouldAutoStart,
  });

  const filteredOrchestrators = useMemo(() => {
    if (!searchQuery.trim()) {
      return orchestrators;
    }

    const query = searchQuery.toLowerCase().trim();

    return orchestrators.filter((orchestrator) => {
      // Search by ENS name
      const ensName =
        orchestrator.ensIdentity?.name || orchestrator.ensName || "";
      if (ensName.toLowerCase().includes(query)) {
        return true;
      }

      // Search by address
      const address = orchestrator.address || "";
      if (address.toLowerCase().includes(query)) {
        return true;
      }

      // Search by description
      const description =
        orchestrator.ensIdentity?.description || orchestrator.description || "";
      if (description.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });
  }, [orchestrators, searchQuery]);

  const [fiatValue, setFiatValue] = useState(0);
  const [stakingFiatValue, setStakingFiatValue] = useState(0);
  const [savingsFiatValue, setSavingsFiatValue] = useState(0);
  const [walletBalanceState, setWalletBalanceState] = useState(0);
  const [walletLoadingState, setWalletLoadingState] = useState(false);
  const [currentWalletId, setCurrentWalletId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!walletType) return;
      
      setWalletLoadingState(true);
      try {
        const chainType = walletType === "savings" ? "solana" : "ethereum";
        let walletResp = await walletService.getPrimaryWallet(chainType);
        
        if (walletType === "savings" && (!walletResp.success || !walletResp.wallet)) {
          const createResp = await walletService.createSolanaWallet({ make_primary: true });
          if (createResp.success && createResp.wallet) {
            walletResp = { success: true, wallet: createResp.wallet };
          }
        }
        
        if (walletResp.success && walletResp.wallet) {
          setCurrentWalletId(walletResp.wallet.id);
          
          const token = walletType === "savings" ? "USDC" : "LPT";
          const balanceResp = await walletService.getBalance(
            walletResp.wallet.wallet_address,
            token
          );
          
          if (balanceResp.success) {
            const balance = parseFloat(balanceResp.balance || "0");
            setWalletBalanceState(balance);
            
            const fiatCurrency = state.user?.fiat_type || "USD";
            let fiat = 0;
            if (walletType === "savings") {
              const prices = await priceService.getPrices();
              fiat = balance;
              if (fiatCurrency === "NGN") {
                fiat = balance * prices.ngn;
              } else if (fiatCurrency === "EUR") {
                fiat = balance * prices.eur;
              } else if (fiatCurrency === "GBP") {
                fiat = balance * prices.gbp;
              }
            } else {
              fiat = await priceService.convertLptToFiat(balance, fiatCurrency);
            }
            
            if (walletType === "savings") {
              setStakingFiatValue(fiat);
            } else {
              setSavingsFiatValue(fiat);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch wallet balance:", error);
      } finally {
        setWalletLoadingState(false);
      }
    };

    if (state.user && walletType) {
      fetchWalletBalance();
    }
  }, [walletType, state.user]);

  const combinedBalance = useMemo(() => {
    return walletBalanceState;
  }, [walletBalanceState]);

  const fiatSymbol = useMemo(() => {
    const fiatCurrency = wallet?.fiatCurrency || state.user?.fiat_type || "USD";
    return priceService.getCurrencySymbol(fiatCurrency);
  }, [wallet?.fiatCurrency, state.user?.fiat_type]);

  const walletBalance = useMemo(() => walletBalanceState, [walletBalanceState]);
  const stakedBalance = useMemo(() => walletBalanceState, [walletBalanceState]);

  const unbondingBalance = useMemo(() => {
    if (!delegatorTransactions?.pendingStakeTransactions?.length) return 0;
    return delegatorTransactions.pendingStakeTransactions.reduce(
      (total, tx) => {
        const value = parseFloat(tx.amount || "0");
        return total + (isNaN(value) ? 0 : value);
      },
      0
    );
  }, [delegatorTransactions]);

  const currentWalletBalance = useMemo(() => {
    return walletBalanceState;
  }, [walletBalanceState]);

  const currentWalletFiatValue = useMemo(() => {
    if (walletType === "staking") {
      return savingsFiatValue;
    } else if (walletType === "savings") {
      return stakingFiatValue;
    }
    return fiatValue;
  }, [walletType, savingsFiatValue, stakingFiatValue, fiatValue]);

  const currentWalletTitle = useMemo(() => {
    if (walletType === "staking") {
      return "Super Yield";
    } else if (walletType === "savings") {
      return "Stables";
    }
    return "Total Balance";
  }, [walletType]);

  const handleStakeClick = () => {
    if (walletType === "savings") {
      navigate("/save", { state: { walletType } });
    } else {
      navigate("/savings-tiers");
    }
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleDepositClick = () => {
    navigate(`/deposit`, { state: { walletType } });
  };

  const handlePortfolioClick = () => {
    navigate("/portfolio", { state: { walletType } });
  };

  const handleWithdrawClick = () => {
    navigate("/withdraw", { state: { walletType } });
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleTransactionClick = (transaction: TransactionData) => {
    navigate(`/transaction-detail/${transaction.id}`);
  };

  const handleViewAllTransactions = () => {
    navigate("/history");
  };

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5);
  }, [transactions]);

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

        <h1 className="text-lg font-medium text-white">
          {walletType === "staking" ? "Super Yield" : "Stables"}
        </h1>

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
                  {walletLoading || delegationLoading || walletLoadingState ? (
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
                {` Interest will be accrued daily ${walletType === "savings" ? "up to 14.9%" : "up to 60%"} per annum`}
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
          <h2 className="text-white/80 text-sm font-medium">Recent transactions</h2>
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
          skeletonCount={3}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/wallet" />

      {/* Balance Information Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title={walletType === "savings" ? "About Stables Wallet" : "About High Yield Wallet"}
        content={
          walletType === "savings"
            ? [
                "Stables offers lower yields with instant withdrawal capabilities.",
                "Your funds are available for withdrawal at any time without waiting periods.",
                "Perfect for emergency funds and short-term savings with stable returns.",
                "Interest is accrued daily and paid out monthly at 14.9% APY.",
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
