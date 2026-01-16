import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { LisarLines } from "@/components/general/lisar-lines";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useGuidedTour } from "@/hooks/useGuidedTour";
import { usePrices } from "@/hooks/usePrices";
import { ALL_WALLET_TOUR_ID } from "@/lib/tourConfig";
import { priceService } from "@/lib/priceService";
import { formatEarnings } from "@/lib/formatters";
import { Bell, CircleQuestionMark, Plus, Eye, EyeOff } from "lucide-react";

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

  useEffect(() => {
    localStorage.setItem("wallet_show_balance", JSON.stringify(showBalance));
  }, [showBalance]);
  const { orchestrators } = useOrchestrators();
  const { state } = useAuth();
  const {
    wallet,
    isLoading: walletLoading,
    stablesBalance: contextStablesBalance,
    highyieldBalance: contextHighyieldBalance,
    stablesLoading,
    highyieldLoading,
  } = useWallet();
  const { delegatorStakeProfile, isLoading: delegationLoading } =
    useDelegation();
  const { unreadCount } = useNotification();
  const { prices } = usePrices();

  // Start tour for non-onboarded users
  const shouldAutoStart = useMemo(() => {
    return state.user?.is_onboarded === false && !state.isLoading;
  }, [state.user?.is_onboarded, state.isLoading]);

  const {} = useGuidedTour({
    tourId: ALL_WALLET_TOUR_ID,
    autoStart: shouldAutoStart,
  });

  const highyieldBalance = contextHighyieldBalance || 0;
  const stablesBalance = contextStablesBalance || 0;

  // For staking: include both unstaked and staked LPT
  const walletBalance = useMemo(() => {
    const unstakedLpt = highyieldBalance;
    const stakedLpt = delegatorStakeProfile
      ? parseFloat(delegatorStakeProfile.currentStake || "0")
      : 0;
    return unstakedLpt + stakedLpt;
  }, [highyieldBalance, delegatorStakeProfile]);

  const stakedBalance = useMemo(() => stablesBalance, [stablesBalance]);

  const ethereumFiatValue = useMemo(() => {
    const fiatCurrency = (state.user?.fiat_type || "USD").toUpperCase();
    const lptPriceInUsd = prices.lpt || 0;
    // Include both unstaked and staked LPT
    const unstakedLpt = highyieldBalance;
    const stakedLpt = delegatorStakeProfile
      ? parseFloat(delegatorStakeProfile.currentStake || "0")
      : 0;
    const totalLpt = unstakedLpt + stakedLpt;
    const usdValue = totalLpt * lptPriceInUsd;

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
  }, [highyieldBalance, prices, state.user?.fiat_type, delegatorStakeProfile]);

  const solanaFiatValue = useMemo(() => {
    const fiatCurrency = (state.user?.fiat_type || "USD").toUpperCase();
    const stableBalance = stablesBalance; // already in USD-equivalent units

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
  }, [stablesBalance, prices, state.user?.fiat_type]);

  // Total USD = EVM LPT in USD (unstaked + staked) + all USD stables
  const totalUsdBalance = useMemo(() => {
    const lptPriceInUsd = prices.lpt || 0;
    // Include both unstaked and staked LPT
    const unstakedLpt = highyieldBalance;
    const stakedLpt = delegatorStakeProfile
      ? parseFloat(delegatorStakeProfile.currentStake || "0")
      : 0;
    const totalLpt = unstakedLpt + stakedLpt;
    const lptUsdValue = totalLpt * lptPriceInUsd;
    const stablesUsdValue = stablesBalance; // already USD-equivalent units
    return lptUsdValue + stablesUsdValue;
  }, [highyieldBalance, stablesBalance, prices, delegatorStakeProfile]);

  // Total NGN equivalent (used under the USD value on the main card)
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
        id: "main",
        title: "Total Balance",
        balance: totalUsdBalance, // show total USD value
        fiatValue: totalNairaBalance, // NGN equivalent
        type: "main",
        gradient: "from-[#0f0f0f] to-[#151515]",
      },
      {
        id: "savings",
        title: "Stables ",
        balance: stakedBalance,
        fiatValue: stakingFiatValue,
        type: "savings",
        gradient: "from-[#151515] to-[#0f0f0f]",
      },
      {
        id: "staking",
        title: "High Yield",
        balance: walletBalance,
        fiatValue: savingsFiatValue,
        type: "staking",
        gradient: "from-[#0f0f0f] to-[#151515]",
      },
    ],
    [
      totalUsdBalance,
      totalNairaBalance,
      stakedBalance,
      stakingFiatValue,
      walletBalance,
      savingsFiatValue,
    ]
  );

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
            onClick={handleNotificationClick}
            className="relative w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#3a3a3a] transition-colors cursor-pointer"
          >
            <Bell size={16} color="#86B3F7" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
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
          {walletCards.map((card, index) => (
            <div
              key={card.id}
              className="min-w-[calc(100%-1.1rem)] snap-center"
              style={{ scrollSnapAlign: "center" }}
            >
              <div
                onClick={() => {
                  // Make clickable for savings and staking cards
                  if (card.type !== "main") {
                    handleDepositClick(card.type, index);
                  }
                }}
                className={`bg-linear-to-br ${card.gradient} rounded-2xl p-6 h-[170px] relative overflow-hidden border border-[#2a2a2a] ${
                  card.type !== "main"
                    ? "cursor-pointer hover:opacity-95 transition-opacity"
                    : ""
                }`}
                data-tour={
                  card.id === "main" ? "all-wallet-balance-card" : undefined
                }
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

                {/* Help Icon - Top Right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedCardType(card.type);
                    setShowBalanceDrawer(true);
                  }}
                  data-tour="all-wallet-help-icon"
                  className="absolute top-6 right-6 z-20 w-6 h-6 bg-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#3a3a3a] transition-colors cursor-pointer"
                  style={{ pointerEvents: "auto" }}
                >
                  <CircleQuestionMark size={14} color="#6a6a6a" />
                </button>

                {/* Wallet Title */}
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white/70 text-sm mb-2">{card.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBalance(!showBalance);
                      }}
                      className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity mb-2"
                    >
                      {showBalance ? (
                        <Eye size={16} color="rgba(255, 255, 255, 0.6)" />
                      ) : (
                        <EyeOff size={16} color="rgba(255, 255, 255, 0.6)" />
                      )}
                    </button>
                  </div>

                  {/* Balance Display */}
                  <div>
                    {walletLoading ||
                    delegationLoading ||
                    stablesLoading ||
                    highyieldLoading ? (
                      <>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-2xl font-bold text-white">
                            ••••
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowBalance(!showBalance);
                            }}
                            className="text-2xl font-bold text-white cursor-pointer"
                          >
                            {showBalance
                              ? formatEarnings(card.balance)
                              : "••••"}
                          </span>
                          {showBalance && (
                            <span className="text-sm text-white/70 ml-[-5px]">
                              {card.type === "main"
                                ? "USD"
                                : card.type === "savings"
                                  ? "USDC"
                                  : "LPT"}
                            </span>
                          )}
                        </div>
                        {showBalance && (
                          <p className="text-white/50 text-sm">
                            {card.id === "main" ? (
                              <>
                                {nairaSymbol}
                                {card.fiatValue.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </>
                            ) : (
                              <>
                                ≈{fiatSymbol}
                                {card.fiatValue.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </>
                            )}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div
                  className={`flex items-center justify-end ${
                    walletLoading || delegationLoading
                      ? "mt-8"
                      : showBalance
                        ? "mt-2"
                        : "mt-8"
                  }`}
                >
                  {card.type === "main" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDepositClick(card.type, index);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#C7EF6B] text-black rounded-full text-[10px] font-semibold hover:bg-[#B8E55A] transition-colors"
                    >
                      View wallets
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDepositClick(card.type, index);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#C7EF6B] text-black rounded-full text-[10px] font-semibold hover:bg-[#B8E55A] transition-colors"
                    >
                      View balance
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {walletCards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollRef.current) {
                  const cardWidth = scrollRef.current.offsetWidth;
                  scrollRef.current.scrollTo({
                    left: cardWidth * index,
                    behavior: "smooth",
                  });
                }
              }}
              className={`h-1 rounded-full transition-all ${
                currentCardIndex === index
                  ? "w-6 bg-[#C7EF6B]"
                  : "w-3 bg-white/20"
              }`}
            ></button>
          ))}
        </div>

        {/* Predict Card */}
        <div
          onClick={() => navigate("/earn")}
          className="mt-6 bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-2xl p-4 border border-[#2a2a2a] relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <div className="shrink-0">
              <img
                src="/tt1.png"
                alt="Predict"
                className="w-16 h-16 object-contain rounded-lg"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-base font-semibold mb-1">
                Early Savers
                {/* <span className="text-black text-xs ml-2 bg-[#C7EF6B] rounded-full px-2.5 py-1  mb-0.5
                ">
                 Active
                </span> */}
              </h3>
              <p className="text-white/60 text-sm">
                Earn rewards building healthy savings habits! Click to get
                started.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Plans Section */}
      <div className="px-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white/70 text-sm font-medium">
            Available Accounts
          </h2>
        </div>

        <div className="space-y-4">
          {/* Stables Card */}
          <div
            className="bg-[#6da7fd] rounded-2xl p-5 border-2 border-[#86B3F7]/30 hover:border-[#86B3F7]/50 transition-colors relative overflow-hidden"
            data-tour="all-wallet-stables-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 relative z-10">
                <h3 className="text-white text-base font-semibold mb-2">
                  Stables
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Earn stable yields with low risk. Perfect for your emergency
                  funds and short-term savings.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/wallet/savings")}
              className="mt-4 px-6 py-2.5 bg-[#438af6] text-white rounded-full text-xs font-semibold hover:bg-[#96C3F7] transition-colors relative z-10"
            >
              Get USD
            </button>

            {/* Bottom Right Image */}
            <img
              src="/highyield-3.svg"
              alt="Stables"
              className="absolute bottom-[-20px] right-[-20px]  w-30 h-28 object-contain opacity-80"
            />
          </div>

          {/* High Yield Card */}
          <div
            className="bg-transparent rounded-2xl p-5 border-2 border-[#C7EF6B]/30 hover:border-[#C7EF6B]/50 transition-colors relative overflow-hidden"
            data-tour="all-wallet-high-yield-card"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 relative z-10">
                <h3 className="text-white text-base font-semibold mb-2">
                  High Yield
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Maximize your returns with higher APY. Long-term growth for
                  your investment goals.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/wallet/staking")}
              className="mt-4 px-6 py-2.5 bg-[#a3d039] text-black rounded-full text-xs font-semibold hover:bg-[#B8E55A] transition-colors relative z-10"
            >
              Explore
            </button>

            {/* Bottom Right Image */}
            <img
              src="/highyield-1.svg"
              alt="High Yield"
              className="absolute bottom-[-5px] right-[-5px] w-21 h-21 object-contain opacity-80"
            />
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
