import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CircleQuestionMark, Eye, EyeOff, RefreshCw } from "lucide-react";
import QRCode from "qrcode";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { usePortfolio, type StakeEntry } from "@/contexts/PortfolioContext";
import { useWalletCard } from "@/contexts/WalletCardContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { RecentTransactionsCard } from "@/components/transactions/RecentTransactionsCard";
import { TransactionDetailsDrawer } from "@/components/transactions/TransactionDetailsDrawer";
import { PortfolioSkeleton } from "./PortfolioSkeleton";
import { formatEarnings, formatStables } from "@/lib/formatters";
import { getColorForAddress } from "@/lib/qrcode";
import { TransactionData } from "@/services/transactions/types";

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
        // QR code generation failed - will not display QR
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
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionData | null>(null);
  const [isCurrencyRotating, setIsCurrencyRotating] = useState(false);

  const walletType =
    (location.state as { walletType?: string })?.walletType || "staking";
  const isSavings = walletType === "savings";

  const {
    cardData,
    displayCurrency,
    setDisplayCurrency,
    showBalance,
    setShowBalance,
    displayFiatSymbol,
  } = useWalletCard();
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

  const card = useMemo(
    () => cardData.find((c) => c.type === (isSavings ? "savings" : "staking")),
    [cardData, isSavings]
  );

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleViewAllTransactions = () => {
    navigate("/history", { state: { walletType } });
  };

  const handleTransactionClick = (transaction: TransactionData) => {
    setSelectedTransaction(transaction);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handleCurrencyToggle = () => {
    setDisplayCurrency(displayCurrency === "USD" ? "NGN" : "USD");
    setIsCurrencyRotating(true);
    setTimeout(() => setIsCurrencyRotating(false), 600);
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
            className="h-10 w-10 rounded-full bg-[#071510] flex items-center justify-center"
          >
            <ArrowLeft className="text-white" size={22} />
          </button>
          <h1 className="text-lg font-medium text-white">Portfolio</h1>
          <button
            onClick={handleHelpClick}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
            <CircleQuestionMark color="#86B3F7" size={16} />
          </button>
        </div>

        {/* Wallet Card */}
        {card && (
          <div className="mb-6">
            <div
              className={`${isSavings
                ? "bg-[#6da7fd] border-2 border-[#86B3F7]/30 hover:border-[#86B3F7]/50"
                : "bg-transparent border-2 border-[#C7EF6B]/30 hover:border-[#C7EF6B]/50"
                } rounded-2xl p-5 relative overflow-hidden transition-colors min-h-[160px]`}
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
                        onClick={() => setShowBalance(!showBalance)}
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
                <div
                  className={`w-fit rounded-xl px-3.5 py-1.5 ${isSavings
                    ? "bg-white/20"
                    : "bg-white/10"
                    }`}
                >
                  <p className="text-white/80 text-[10px] mb-0.5">
                    Interest earned
                  </p>
                  <p className="text-white text-sm font-semibold">
                    {displayFiatSymbol}
                    {(displayCurrency === "NGN"
                      ? card.projectedInterestNgn
                      : card.projectedInterestUsd
                    ).toLocaleString(undefined, {
                      minimumFractionDigits:
                        displayCurrency === "NGN" ? 2 : 3,
                      maximumFractionDigits:
                        displayCurrency === "NGN" ? 2 : 3,
                    })}
                    <span className="text-white/70 text-xs font-normal ml-1">
                      at ({card.apyPercent}% p.a)
                    </span>
                  </p>
                </div>
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
        )}

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

      <TransactionDetailsDrawer
        transaction={selectedTransaction}
        isOpen={selectedTransaction !== null}
        onClose={() => setSelectedTransaction(null)}
      />

      <BottomNavigation currentPath="/portfolio" />
    </div>
  );
};
