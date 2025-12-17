import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Trophy,
  ChevronDown,
  CircleQuestionMark,
  ChevronUp,
  Info,
  CircleDollarSign,
  Eye,
  EyeOff,
  TrendingUp,
} from "lucide-react";
import QRCode from "qrcode";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { EmptyState } from "@/components/general/EmptyState";
import { LisarLines } from "@/components/general/lisar-lines";
import { PayoutProgressCircle } from "@/components/general/PayoutProgressCircle";
import { useDelegation } from "@/contexts/DelegationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { usePortfolio, type StakeEntry } from "@/contexts/PortfolioContext";
import { RecentTransactionsCard } from "@/components/wallet/RecentTransactionsCard";
import { PortfolioSkeleton } from "./PortfolioSkeleton";
import { formatEarnings, formatLifetime } from "@/lib/formatters";
import { getColorForAddress } from "@/lib/qrcode";
import { priceService } from "@/lib/priceService";

interface StakeEntryItemProps {
  entry: StakeEntry;
  onClick: () => void;
}

const StakeEntryItem: React.FC<StakeEntryItemProps> = ({ entry, onClick }) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [avatarError, setAvatarError] = useState(false);

  const avatar =
    entry.orchestrator?.avatar || entry.orchestrator?.ensIdentity?.avatar;

  useEffect(() => {
    if (!entry.id || !qrCanvasRef.current) return;

    if (avatar && !avatarError) return;

    const qrColor = getColorForAddress(entry.id);

    QRCode.toCanvas(
      qrCanvasRef.current,
      entry.id,
      {
        width: 40,
        margin: 1,
        color: {
          dark: qrColor,
          light: "#1a1a1a",
        },
      },
      (error) => {
        if (error) console.error("QR Code generation error:", error);
      }
    );
  }, [entry.id, avatar, avatarError]);

  return (
    <div
      className="bg-[#1a1a1a] rounded-xl p-4 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {avatar && !avatarError ? (
            <img
              src={avatar}
              alt={entry.name}
              className="w-10 h-10 rounded-full object-cover"
              onError={() => {
                setAvatarError(true);
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
              <canvas
                ref={qrCanvasRef}
                className="w-full h-full rounded-full"
              />
            </div>
          )}
          <div>
            <p className="text-gray-100 font-medium">
              {entry.name.length > 20
                ? `${entry.name.substring(0, 16)}..`
                : entry.name}
            </p>
            <p className="text-gray-400 text-xs">
              Staked: {formatEarnings(entry.yourStake)} LPT
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[#C7EF6B] font-medium text-sm">
            APY: {entry.apy * 100}%
          </p>
          <p className="text-gray-400 text-xs">Fee: {entry.fee.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};

export const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("portfolio_show_balance");
    return saved ? JSON.parse(saved) : true;
  });

  const walletType =
    (location.state as { walletType?: string })?.walletType || "staking";
  const isSavings = walletType === "savings";

  const { protocolStatus } = useDelegation();
  const { state } = useAuth();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const {
    setMode,
    summary,
    stakeEntries,
    isLoading: portfolioLoading,
  } = usePortfolio();

  useEffect(() => {
    setMode(isSavings ? "savings" : "staking");
  }, [isSavings, setMode]);

  const isLoading = useMemo(() => {
    if (isSavings) {
      return portfolioLoading && !summary;
    } else {
      return portfolioLoading && !summary && stakeEntries.length === 0;
    }
  }, [portfolioLoading, summary, stakeEntries.length, isSavings]);

  useEffect(() => {
    localStorage.setItem("portfolio_show_balance", JSON.stringify(showBalance));
  }, [showBalance]);

  // Get recent transactions (last 5), filtered like wallet view
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

  // Calculate next payout progress using protocol status
  const nextPayoutProgress = useMemo(() => {
    if (!protocolStatus) return { progress: 85, timeRemaining: "22 hrs" };

    const { roundLength, blocksIntoRound, blocksRemaining, estimatedHours } =
      protocolStatus;
    const progress =
      roundLength > 0 ? (blocksIntoRound / roundLength) * 100 : 85;

    // Format time remaining - show minutes when less than 1 hour
    let timeRemaining: string;
    if (
      estimatedHours !== undefined &&
      estimatedHours < 1 &&
      estimatedHours > 0
    ) {
      // Convert hours to minutes (approximately 2 seconds per block on Arbitrum)
      const minutes = Math.round(estimatedHours * 60);
      timeRemaining =
        minutes > 0
          ? `${minutes} min${minutes !== 1 ? "s" : ""}`
          : "Less than 1 min";
    } else {
      timeRemaining = protocolStatus.estimatedHoursHuman || "22 hrs";
    }

    return { progress: Math.min(progress, 100), timeRemaining };
  }, [protocolStatus]);

  const totalStake = summary?.totalStake || 0;
  const lifetimeRewards = summary?.lifetimeRewards || 0;
  const averageApy = summary?.averageApy || 0;

  // Calculate fiat value for total stake
  const [totalStakeFiat, setTotalStakeFiat] = useState(0);
  const fiatCurrency = state.user?.fiat_type || "USD";
  const fiatSymbol = useMemo(() => {
    return priceService.getCurrencySymbol(fiatCurrency);
  }, [fiatCurrency]);

  useEffect(() => {
    const calculateFiat = async () => {
      if (isSavings) {
        const prices = await priceService.getPrices();
        let fiatValue = totalStake;
        switch (fiatCurrency.toUpperCase()) {
          case "NGN":
            fiatValue = totalStake * prices.ngn;
            break;
          case "EUR":
            fiatValue = totalStake * prices.eur;
            break;
          case "GBP":
            fiatValue = totalStake * prices.gbp;
            break;
          case "USD":
          default:
            fiatValue = totalStake;
        }
        setTotalStakeFiat(fiatValue);
      } else {
        const fiatValue = await priceService.convertLptToFiat(
          totalStake,
          fiatCurrency
        );
        setTotalStakeFiat(fiatValue);
      }
    };
    calculateFiat();
  }, [totalStake, fiatCurrency, isSavings]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleViewAllTransactions = () => {
    navigate("/history", { state: { walletType } });
  };

  const handleTransactionClick = (transaction: any) => {
    navigate(`/transaction-detail/${transaction.id}`);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  if (isLoading) {
    return <PortfolioSkeleton />;
  }

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
        <div className="flex items-center justify-between py-8 mb-2">
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center"
          >
            <ChevronLeft color="#C7EF6B" />
          </button>
          <h1 className="text-lg font-medium text-white">Portfolio</h1>
          <button
            onClick={handleHelpClick}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#86B3F7" size={16} />
          </button>
        </div>
        {/* Main Wallet Card */}
        <div
          className={`${isSavings ? "bg-[#6da7fd] border-2 border-[#86B3F7]/30" : "bg-linear-to-br from-[#0f0f0f] to-[#151515] border border-[#2a2a2a]"} rounded-2xl p-6 h-[170px] mb-6 relative overflow-hidden`}
        >
          {/* Lisar Lines Decoration */}
          {!isSavings && (
            <LisarLines
              position="top-right"
              className="opacity-100"
              width="185px"
              height="185px"
            />
          )}

          {/* Decorative elements */}
          {isSavings ? (
            <>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#86B3F7]/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#438af6]/10 rounded-full blur-2xl"></div>
            </>
          ) : (
            <>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7EF6B]/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#86B3F7]/5 rounded-full blur-2xl"></div>
            </>
          )}

          {/* Circular Progress - Top Right */}
          {/* <div className="absolute top-4 right-4 z-20">
            <PayoutProgressCircle
              progress={nextPayoutProgress.progress}
              timeRemaining={nextPayoutProgress.timeRemaining}
              isSavings={isSavings}
            />
          </div> */}

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-white/70 text-sm">
                {" "}
                {isSavings ? "Stables Wallet" : "High Yield Wallet"}
              </h3>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
              >
                {showBalance ? (
                  <Eye
                    size={16}
                    color={
                      isSavings
                        ? "rgba(255, 255, 255, 0.9)"
                        : "rgba(255, 255, 255, 0.6)"
                    }
                  />
                ) : (
                  <EyeOff
                    size={16}
                    color={
                      isSavings
                        ? "rgba(255, 255, 255, 0.9)"
                        : "rgba(255, 255, 255, 0.6)"
                    }
                  />
                )}
              </button>
            </div>

            {/* Main Balance */}
            <div className="mb-8">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-semibold text-white/90">
                  {showBalance
                    ? `${fiatSymbol}${totalStakeFiat.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "••••"}
                </span>
              </div>
            </div>

            {/* Three Values */}
            <div className="flex items-center justify-between">
              {/* Token Amount */}
              <div className="flex items-center flex-col">
                <p className="text-white/90 font-semibold text-sm">
                  {showBalance ? formatEarnings(totalStake) : "••••"}
                </p>
                <p className="text-white/60 text-xs">
                  {isSavings ? "USDC" : "LPT"}
                </p>
              </div>

              {/* APY */}
              <div className="flex items-center flex-col">
                <p className="text-white/90 font-semibold text-sm">
                  {showBalance ? `${averageApy.toFixed(1)}%` : "••••"}
                </p>
                <p className="text-white/60 text-xs">Per annum</p>
              </div>

              {/* Total Earnings */}
              <div className="flex items-center flex-col">
                <p className="text-white/90 font-semibold text-sm">
                  {showBalance ? formatLifetime(lifetimeRewards) : "••••"}
                </p>
                <p className="text-white/60 text-xs">Total earning</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Summary Card */}
          <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-2xl p-5 border border-[#2a2a2a] relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 relative z-10">
                <h3 className="text-white/90 text-base font-medium mb-2">
                  Summary
                </h3>
                <p className="text-white/60 text-xs">
                  View breakdown of your portfolio
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate("/portfolio/summary", { state: { walletType } })
              }
              className="mt-1 px-6 py-2 bg-[#438af6] text-white rounded-full text-xs font-semibold hover:bg-[#96C3F7] transition-colors relative z-10"
            >
              Show
            </button>
          </div>

          {/* My Positions Card */}
          <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-2xl p-5 border border-[#2a2a2a] relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 relative z-10">
                <h3 className="text-white/90 text-base font-medium mb-2">
                  My Vest
                </h3>
                <p className="text-white/60 text-xs">
                  Track all your active earning positions.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate("/portfolio/positions", { state: { walletType } })
              }
              className="mt-1 px-6 py-2 bg-[#a3d039] text-black rounded-full text-xs font-semibold hover:bg-[#B8E55A] transition-colors relative z-10"
            >
              Show
            </button>
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-white/80 text-sm font-medium">
              Recent transactions
            </h2>
            {transactions.length > 0 && (
              <button
                onClick={handleViewAllTransactions}
                className="text-[#C7EF6B] text-sm hover:opacity-70 transition-opacity"
              >
                See all
              </button>
            )}
          </div>

          <RecentTransactionsCard
            transactions={recentTransactions}
            isLoading={transactionsLoading}
            onTransactionClick={handleTransactionClick}
          />
        </div>
      </div>

      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Portfolio Guide"
        content={[
          "View your total stake, earnings, and current staking positions in one place.",
          "Total stake shows your combined investment across all validators.",
          "Earnings can be viewed weekly, monthly, or yearly. Next payout shows when you'll receive rewards.",
        ]}
      />

      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};
