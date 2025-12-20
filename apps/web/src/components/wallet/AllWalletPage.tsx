import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { OrchestratorList } from "../validator/OrchestratorList";
import { WalletActionButtons } from "./WalletActionButtons";
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
import { usePrices } from "@/hooks/usePrices";
import { WALLET_TOUR_ID } from "@/lib/tourConfig";
import { priceService } from "@/lib/priceService";
import { formatFiat } from "@/lib/formatters";
import { isProduction } from "@/lib/utils";
import {
  Search,
  Bell,
  CircleQuestionMark,
  ArrowRight,
  Plus,
  Eye,
  EyeOff,
  ChevronRight,
  LayersIcon,
  Landmark,
  ArrowDown,
  ArrowUp,
  ChartSpline,
  SquareMinus,
  Headset,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AllWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showBalanceDrawer, setShowBalanceDrawer] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem("wallet_show_balance");
    return saved ? JSON.parse(saved) : false;
  });

  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "NGN">(
    () => {
      const saved = localStorage.getItem("wallet_currency");
      return (saved as "USD" | "NGN") || "USD";
    }
  );

  useEffect(() => {
    localStorage.setItem("wallet_show_balance", JSON.stringify(showBalance));
  }, [showBalance]);

  useEffect(() => {
    localStorage.setItem("wallet_currency", selectedCurrency);
  }, [selectedCurrency]);

  const { orchestrators, isLoading, error, refetch } = useOrchestrators();
  const { state } = useAuth();
  const {
    wallet,
    isLoading: walletLoading,
    solanaBalance: contextSolanaBalance,
    ethereumBalance: contextEthereumBalance,
    solanaLoading,
    ethereumLoading,
  } = useWallet();
  const { isLoading: delegationLoading } = useDelegation();
  const { unreadCount } = useNotification();
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

  const ethereumBalance = contextEthereumBalance || 0;
  const solanaBalance = contextSolanaBalance || 0;

  const walletBalance = useMemo(() => ethereumBalance, [ethereumBalance]);
  const stakedBalance = useMemo(() => solanaBalance, [solanaBalance]);

  const ethereumFiatValue = useMemo(() => {
    const fiatCurrency = (state.user?.fiat_type || "USD").toUpperCase();
    const lptPriceInUsd = prices.lpt || 0;
    const usdValue = ethereumBalance * lptPriceInUsd;

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
  }, [ethereumBalance, prices, state.user?.fiat_type]);

  const solanaFiatValue = useMemo(() => {
    const fiatCurrency = (state.user?.fiat_type || "USD").toUpperCase();
    const stableBalance = solanaBalance; // already in USD-equivalent units

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
  }, [solanaBalance, prices, state.user?.fiat_type]);

  const fiatValue = useMemo(
    () => ethereumFiatValue + solanaFiatValue,
    [ethereumFiatValue, solanaFiatValue]
  );

  // Total USD = EVM LPT in USD + all USD stables
  const totalUsdBalance = useMemo(() => {
    const lptPriceInUsd = prices.lpt || 0;
    const lptUsdValue = ethereumBalance * lptPriceInUsd;
    const stablesUsdValue = solanaBalance;
    return lptUsdValue + stablesUsdValue;
  }, [ethereumBalance, solanaBalance, prices]);

  // Total NGN equivalent
  const totalNairaBalance = useMemo(() => {
    const nairaRate = prices.ngn || 0;
    return totalUsdBalance * nairaRate;
  }, [totalUsdBalance, prices]);

  const fiatSymbol = useMemo(() => {
    const fiatCurrency = wallet?.fiatCurrency || state.user?.fiat_type || "USD";
    return priceService.getCurrencySymbol(fiatCurrency);
  }, [wallet?.fiatCurrency, state.user?.fiat_type]);

  const nairaSymbol = useMemo(() => priceService.getCurrencySymbol("NGN"), []);

  const handleNotificationClick = () => {
    navigate("/notifications");
  };

  const handleSupportClick = () => {
    window.open(
      "https://t.me/+F0YXOMaiJMxkODVk",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleDepositClick = (walletType?: string, cardIndex?: number) => {
    if (walletType === "main") {
      if (scrollRef.current && cardIndex !== undefined) {
        const cardWidth = scrollRef.current.offsetWidth;
        const nextIndex = Math.min(cardIndex + 1, 2);
        scrollRef.current.scrollTo({
          left: cardWidth * nextIndex,
          behavior: "smooth",
        });
        setCurrentCardIndex(nextIndex);
      }
      return;
    }
    if (walletType) {
      navigate(`/wallet/${walletType}`);
    } else {
      navigate("/deposit", { state: { walletType: undefined } });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentCardIndex(newIndex);
    }
  };

  const stakingFiatValue = useMemo(() => solanaFiatValue, [solanaFiatValue]);
  const savingsFiatValue = useMemo(
    () => ethereumFiatValue,
    [ethereumFiatValue]
  );

  const walletCards = useMemo(
    () => [
      {
        id: "balance",
        title: "Wallet Balance",
        type: "balance",
        gradient: "from-[#0f0f0f] to-[#151515]",
      },
      {
        id: "earnings",
        title: "Daily Earnings",
        type: "earnings",
        gradient: "from-[#151515] to-[#0f0f0f]",
      },
    ],
    []
  );

  // Calculate total balance for display
  const totalBalance = useMemo(() => {
    const nairaRate = prices.ngn || 0;
    return selectedCurrency === "NGN" ? totalNairaBalance : totalUsdBalance;
  }, [selectedCurrency, totalNairaBalance, totalUsdBalance]);

  // Calculate total daily earnings
  const totalDailyEarnings = useMemo(() => {
    const nairaRate = prices.ngn || 0;
    const lptPriceInUsd = prices.lpt || 0;

    // APY rates
    const stablesAPY = 14; // 14% APY for stables
    const highYieldAPY = 68; // Average 68% APY for high yield

    // Calculate daily earnings
    const stablesDaily = (solanaBalance * stablesAPY) / (100 * 365);
    const highYieldDaily =
      (ethereumBalance * lptPriceInUsd * highYieldAPY) / (100 * 365);
    const totalDaily = stablesDaily + highYieldDaily;

    return selectedCurrency === "NGN" ? totalDaily * nairaRate : totalDaily;
  }, [selectedCurrency, solanaBalance, ethereumBalance, prices]);

  // Handle scroll to next card
  const handleScrollToNext = (currentIndex: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth;
      const nextIndex = Math.min(currentIndex + 1, walletCards.length - 1);
      scrollRef.current.scrollTo({
        left: cardWidth * nextIndex,
        behavior: "smooth",
      });
      setCurrentCardIndex(nextIndex);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
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
            <span className="text-gray-100 text-sm font-medium">
              {state.user?.full_name?.split(" ")[0] || "User"}!
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSupportClick}
            className="w-11 h-11 bg-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#3a3a3a] transition-colors cursor-pointer"
          >
            <Headset size={20} color="#9a9a9a" />
          </button>
        </div>
      </div>

      {/* Wallet Cards Carousel */}
      <div className="px-6 pb-6">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {walletCards.map((card, index) => {
            const currencySymbol =
              selectedCurrency === "NGN" ? nairaSymbol : "$";
            const isBalanceCard = card.id === "balance";
            const displayValue = isBalanceCard
              ? totalBalance
              : totalDailyEarnings;

            return (
              <div
                key={card.id}
                className="min-w-[calc(100%-1.1rem)] snap-center"
                style={{ scrollSnapAlign: "center" }}
              >
                <div
                  className={`bg-linear-to-br ${card.gradient} rounded-2xl p-6 h-[150px] relative overflow-hidden border border-[#2a2a2a]`}
                >
                  {/* Lisar Lines Decoration */}
                  <LisarLines
                    position="top-right"
                    className="opacity-100"
                    width="185px"
                    height="185px"
                  />

                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7EF6B]/5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#86B3F7]/5 rounded-full blur-2xl"></div>

                  {/* Wallet Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Centered Currency Select and Balance */}
                    <div className="flex flex-col items-center justify-center flex-1 gap-2">
                      {/* Currency Select - Only show on balance card */}
                      {isBalanceCard && (
                        <Select
                          value={selectedCurrency}
                          onValueChange={(value) =>
                            setSelectedCurrency(value as "USD" | "NGN")
                          }
                        >
                          <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white/90 hover:bg-[#222] rounded-full px-2.5 py-1.5 h-auto w-fit">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    selectedCurrency === "USD"
                                      ? "/us-flag.png"
                                      : "/ng-flag.png"
                                  }
                                  alt={
                                    selectedCurrency === "USD"
                                      ? "US Flag"
                                      : "Nigeria Flag"
                                  }
                                  className="w-4 h-4 object-contain"
                                />
                                <span className="text-xs font-medium">
                                  {selectedCurrency === "USD"
                                    ? "US Dollar"
                                    : "Nigeria Naira"}
                                </span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a]">
                            <SelectItem value="USD" className="text-white/90 ">
                              <div className="flex items-center gap-2">
                                <img
                                  src="/us-flag.png"
                                  alt="US Flag"
                                  className="w-4 h-4 object-contain"
                                />
                                <span>Dollar</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="NGN" className="text-white/90 ">
                              <div className="flex items-center gap-2">
                                <img
                                  src="/ng-flag.png"
                                  alt="Nigeria Flag"
                                  className="w-4 h-4 object-contain"
                                />
                                <span>Naira</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {/* Value Display */}
                      {walletLoading ||
                      delegationLoading ||
                      solanaLoading ||
                      ethereumLoading ? (
                        <div className="flex items-center gap-2">
                          {currencySymbol}
                          <span className="text-3xl font-bold text-white">
                            ••••••
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            onClick={() =>
                              isBalanceCard && setShowBalance(!showBalance)
                            }
                            className={`text-2xl font-semibold text-white ${isBalanceCard ? "cursor-pointer" : ""}`}
                          >
                            {currencySymbol}
                            {isBalanceCard && !showBalance ? (
                              "••••••"
                            ) : (
                              <>{formatFiat(displayValue)}</>
                            )}
                          </span>
                          {isBalanceCard && (
                            <button
                              onClick={() => setShowBalance(!showBalance)}
                              className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                            >
                              {showBalance ? (
                                <Eye
                                  size={18}
                                  color="rgba(255, 255, 255, 0.6)"
                                />
                              ) : (
                                <EyeOff
                                  size={18}
                                  color="rgba(255, 255, 255, 0.6)"
                                />
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Daily Earnings Text - Only show on balance card */}
                      {isBalanceCard &&
                        !walletLoading &&
                        !delegationLoading &&
                        !solanaLoading &&
                        !ethereumLoading && (
                          <button
                            onClick={() => handleScrollToNext(index)}
                            className="flex items-center gap-0.5 text-xs text-white/60 hover:text-white/80 transition-colors mt-1"
                          >
                            <span>
                              You've earned{" "}
                              <span className="text-[#C7EF6B]">
                                {currencySymbol}
                                {formatFiat(totalDailyEarnings)}
                              </span>{" "}
                              today
                            </span>
                            <ChevronRight size={14} />
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons - Only show once below cards */}
        <div className="flex gap-3 px-2 justify-center mt-0 mr-2">
          <button
            onClick={() => handleDepositClick("savings", 0)}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-[#222] transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            <p>Add funds</p>
          </button>
          <button
            onClick={() => navigate("/wallet/savings")}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-[#222] transition-colors flex items-center justify-center gap-2"
          >
            <Landmark size={16} />
            <p>Withdraw</p>
          </button>
        </div>
      </div>

      {/* Savings Plans Section */}
      <div className="px-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white/70 text-sm font-medium">
            Suggested for you
          </h2>
        </div>

        <div className="space-y-4">
          {/* Stables Card */}
          <div className="bg-[#6da7fd] rounded-2xl py-3 px-5 border-2 border-[#86B3F7]/30 hover:border-[#86B3F7]/50 transition-colors relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 relative z-10">
                <h3 className="text-white text-base font-semibold mb-2">
                  Savings
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Lock a portion of your balance towards an expectation and earn
                  rewards.
                </p>
              </div>
            </div>

            {isProduction() ? (
              <button
                disabled
                className="mt-2 px-3 py-1.5 bg-[#7daff6] text-white/90 rounded-full text-sm font-semibold cursor-not-allowed relative z-10"
              >
                coming soon
              </button>
            ) : (
              <button
                onClick={() => navigate("/wallet/savings")}
                className="mt-2 px-6 py-2.5 bg-[#438af6] text-white rounded-full text-xs font-semibold hover:bg-[#96C3F7] transition-colors relative z-10"
              >
                Save Now
              </button>
            )}

            {/* Bottom Right Image */}
            <img
              src="/highyield-3.svg"
              alt="Stables"
              className="absolute bottom-[-20px] right-[-20px]  w-30 h-28 object-contain opacity-80"
            />
          </div>

          {/* High Yield Card */}
          <div className="bg-transparent rounded-2xl py-3 px-5 border-2 border-[#C7EF6B]/30 hover:border-[#C7EF6B]/50 transition-colors relative overflow-hidden">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 relative z-10">
                <h3 className="text-white text-base font-semibold mb-2">
                  Staking
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Stake your balance on decentralized networks and earn rewards.
                  Up to 40% APY.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/wallet/staking")}
              className="mt-2 px-6 py-2.5 bg-[#a3d039] text-black rounded-full text-xs font-semibold hover:bg-[#B8E55A] transition-colors relative z-10"
            >
              Learn More
            </button>

            {/* Bottom Right Image */}
            <img
              src="/highyield-1.svg"
              alt="High Yield"
              className="absolute bottom-[-5px] right-[-5px] w-21 h-21 object-contain opacity-80"
            />
          </div>
        </div>

        {/* Predict Card */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <h2 className="text-white/70 text-sm font-medium">
            Upcoming features
          </h2>
        </div>

        <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-2xl p-4 border border-[#2a2a2a] relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <img
                src="/pred1.png"
                alt="Predict"
                className="w-16 h-16 object-contain rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-base font-semibold mb-1">
                Predict and win
                <span className="text-white/90 text-xs ml-2 bg-[#2a2a2a] rounded-full px-2 py-1">
                  coming soon
                </span>
              </h3>
              <p className="text-white/60 text-sm">
                Trade on real-world events like sports and politics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/wallet" />

      {/* Balance Information Drawer */}
      <HelpDrawer
        isOpen={showBalanceDrawer}
        onClose={() => {
          setShowBalanceDrawer(false);
          setSelectedCardType(null);
        }}
        title={
          selectedCardType === "main"
            ? "Total Balance"
            : selectedCardType === "savings"
              ? "Stables Wallet"
              : selectedCardType === "staking"
                ? "High Yield Wallet"
                : "Balance Information"
        }
        content={
          selectedCardType === "main"
            ? [
                "Your total balance combines all your wallet balances.",
                "Swipe right to see other wallets and their balance",
                "This gives you a complete overview of your entire portfolio value.",
              ]
            : selectedCardType === "savings"
              ? [
                  "Stables wallet holds your USDC savings with a stable 14% APY.",
                  "Your balance shows the total USDC you have in your wallet.",
                  "Interest accrues daily and is paid out automatically.",
                ]
              : selectedCardType === "staking"
                ? [
                    "High Yield wallet shows your livepeer token balance.",
                    "Earn up to 62% APY by staking with high-performing validators.",
                    "Rewards are distributed automatically after the cycle completes.",
                  ]
                : [
                    "Your total balance is a combination of all your wallet balances",
                    "Swipe right to see other wallets and their balance",
                    "You can tap on the balance to show/hide",
                  ]
        }
      />
    </div>
  );
};
