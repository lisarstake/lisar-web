import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { LisarLines } from "@/components/general/lisar-lines";
import { GrowLoader } from "@/components/general/GrowLoader";
import { WalletActionButtons } from "./WalletActionButtons";
import { ConfirmDrawer } from "@/components/ui/ConfirmDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useGrow } from "@/contexts/GrowContext";
import { usePrices } from "@/hooks/usePrices";
import { priceService } from "@/lib/priceService";
import { formatFiat } from "@/lib/formatters";
import {
  Eye,
  EyeOff,
  Headset,
  LockKeyhole,
  CircleQuestionMark,
  ChevronLeft,
  Sprout,
} from "lucide-react";
import { highYieldTiers, stableYieldTiers } from "@/mock";

export const GrowPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setGrowMode, setLoading } = useGrow();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showExitDrawer, setShowExitDrawer] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const locationState = location.state as {
    walletType?: string;
    action?: "deposit" | "withdraw" | "vest";
  } | null;

  const action = locationState?.action || "vest";

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

  const { state } = useAuth();
  const {
    isLoading: walletLoading,
    solanaBalance: contextSolanaBalance,
    ethereumBalance: contextEthereumBalance,
    solanaLoading,
    ethereumLoading,
  } = useWallet();
  const { isLoading: delegationLoading } = useDelegation();
  const { prices } = usePrices();

  const ethereumBalance = contextEthereumBalance || 0;
  const solanaBalance = contextSolanaBalance || 0;

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

  const nairaSymbol = useMemo(() => priceService.getCurrencySymbol("NGN"), []);

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

  const handleDepositClick = () => {
    navigate("/earn/deposit");
  };

  const handleStakeClick = () => {
    navigate("/tiers");
  };

  const handleHighYieldExplore = (tierNumber: number, tierTitle: string) => {
    if (tierNumber === 1) {
      navigate("/validator", {
        state: {
          tierName: tierTitle,
          tierNumber,
          tierTitle,
        },
      });
    }
  };

  const handleStableExplore = (tierNumber: number, tierTitle: string) => {
    const provider = tierNumber === 1 ? "maple" : "perena";

    if (action === "deposit") {
      navigate("/deposit", {
        state: {
          walletType: "savings",
          tierNumber,
          tierTitle,
          provider,
        },
      });
    } else if (action === "withdraw") {
      navigate("/withdraw", {
        state: {
          walletType: "savings",
          tierNumber,
          tierTitle,
          provider,
        },
      });
    } else {
      navigate("/save", {
        state: {
          walletType: "savings",
          tierNumber,
          tierTitle,
          provider,
        },
      });
    }
  };

  const getButtonText = (isLocked: boolean, isHighYield: boolean) => {
    if (isLocked && isHighYield) return "Locked";
    if (action === "deposit") return "Deposit";
    if (action === "withdraw") return "Withdraw";
    return isHighYield ? "Subscribe" : "Subscribe";
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  const handlePortfolioClick = () => {
    navigate("/portfolio");
  };

  const handleWithdrawClick = () => {
    navigate("/earn/withdraw");
  };

  // Calculate total balance for display
  const totalBalance = useMemo(() => {
    return selectedCurrency === "NGN" ? totalNairaBalance : totalUsdBalance;
  }, [selectedCurrency, totalNairaBalance, totalUsdBalance]);

  // Calculate total daily earnings in USD
  const totalDailyEarningsUsd = useMemo(() => {
    const lptPriceInUsd = prices.lpt || 0;

    // APY rates
    const stablesAPY = 14; // 14% APY for stables
    const highYieldAPY = 68; // Average 68% APY for high yield

    // Calculate daily earnings
    const stablesDaily = (solanaBalance * stablesAPY) / (100 * 365);
    const highYieldDaily =
      (ethereumBalance * lptPriceInUsd * highYieldAPY) / (100 * 365);
    return stablesDaily + highYieldDaily;
  }, [solanaBalance, ethereumBalance, prices]);

  // Calculate total daily earnings in NGN
  const totalDailyEarningsNgn = useMemo(() => {
    const nairaRate = prices.ngn || 0;
    return totalDailyEarningsUsd * nairaRate;
  }, [totalDailyEarningsUsd, prices]);

  // Calculate total daily earnings (for display based on selected currency)
  const totalDailyEarnings = useMemo(() => {
    return selectedCurrency === "NGN"
      ? totalDailyEarningsNgn
      : totalDailyEarningsUsd;
  }, [selectedCurrency, totalDailyEarningsNgn, totalDailyEarningsUsd]);

  const currencySymbol = selectedCurrency === "NGN" ? nairaSymbol : "$";

  // Set grow mode when component mounts
  useEffect(() => {
    setGrowMode(true);
  }, [setGrowMode]);

  const handleBackClick = () => {
    setShowExitDrawer(true);
  };

  const handleExitGrow = () => {
    setIsExiting(true);
    setShowExitDrawer(false);
    setLoading(true);
    setGrowMode(false);

    setTimeout(() => {
      setIsExiting(false);
      setLoading(false);
      setGrowMode(false);
      navigate("/wallet");
    }, 3000);
  };

  return (
    <>
      <GrowLoader isVisible={isExiting} />

      <div className="min-h-screen bg-[#181818] text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-8">
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center"
          >
            <ChevronLeft color="#C7EF6B" />
          </button>

          <h1 className="text-lg font-medium text-white/90 flex items-center gap-1.5">
            Earn{" "}
            <span>
              <Sprout size={20} />
            </span>
          </h1>

          <button
            onClick={handleHelpClick}
            className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
          >
           <CircleQuestionMark color="#9ca3af" size={16} />
          </button>
        </div>

        {/* Wallet Card */}
        <div className="px-6 pb-3">
          <div className="bg-linear-to-br from-[#0f0f0f] to-[#151515] rounded-2xl p-6 h-[150px] relative overflow-hidden border border-[#2a2a2a]">
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
              <div className="flex flex-col items-center justify-center flex-1 gap-2">
                {/* Currency Select */}
                <p className="text-white/70 text-sm font-medium">
                  Earn Balance
                </p>

                {/* Value Display */}
                {walletLoading ||
                delegationLoading ||
                solanaLoading ||
                ethereumLoading ? (
                  <div className="flex items-center gap-2">
                    {selectedCurrency === "NGN" ? nairaSymbol : "$"}
                    <span className="text-3xl font-bold text-white">•••••</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-2xl font-semibold text-white cursor-pointer"
                    >
                      {selectedCurrency === "NGN" ? nairaSymbol : "$"}
                      {!showBalance ? (
                        "••••••"
                      ) : (
                        <>{formatFiat(totalBalance)}</>
                      )}
                    </span>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      {showBalance ? (
                        <Eye size={18} color="rgba(255, 255, 255, 0.6)" />
                      ) : (
                        <EyeOff size={18} color="rgba(255, 255, 255, 0.6)" />
                      )}
                    </button>
                  </div>
                )}

                {/* Daily Earnings Text */}
                {!walletLoading &&
                  !delegationLoading &&
                  !solanaLoading &&
                  !ethereumLoading && (
                    <button className="flex items-center gap-0.5 text-xs text-white/60 hover:text-white/80 transition-colors mt-1">
                      <span>
                        You've earned{" "}
                        <span className="text-[#C7EF6B]">
                          {currencySymbol}
                          {formatFiat(totalDailyEarnings)}
                        </span>{" "}
                        today
                      </span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <WalletActionButtons
          onDepositClick={handleDepositClick}
          onStakeClick={handleStakeClick}
          onPortfolioClick={handlePortfolioClick}
          onWithdrawClick={handleWithdrawClick}
        />

        {/* Earn Section */}
        <div className="px-6 pb-20">
          <p className="text-white/70 text-sm font-medium my-4 ml-2">
            Suggested for you
          </p>
          <div className="flex items-center justify-between my-4">
            <div className="space-y-4">
              {stableYieldTiers.map((tier) => (
                <div
                  key={`stable-${tier.id}`}
                  className={`${tier.bgColor} rounded-2xl py-3 px-5 relative overflow-hidden transition-colors`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 relative z-10">
                      <h3 className="text-white/90 text-base font-semibold mb-2">
                        {tier.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/80">
                        {tier.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStableExplore(tier.id, tier.title)}
                    className={`mt-4 px-5 py-2 ${tier.buttonBg} ${tier.buttonText} rounded-full text-xs font-semibold transition-colors relative z-10 flex items-center gap-2`}
                  >
                    <span>{getButtonText(false, false)}</span>
                  </button>

                  {/* Bottom Right Image with flowing white highlight */}
                  {/* <div className="pointer-events-none absolute bottom-[-20px] right-[-24px] w-28 h-18 rounded-[999px] bg-white/90 rotate-[-18deg]" /> */}
                  <img
                    src={tier.image}
                    alt={tier.title}
                    className={`absolute bottom-[4px] right-[4px] ${tier.imageClass}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="space-y-4">
              {highYieldTiers.map((tier) => (
                <div
                  key={`high-yield-${tier.id}`}
                  className={`${tier.bgColor} rounded-2xl py-3 px-5 relative overflow-hidden transition-colors`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 relative z-10">
                      <h3 className="text-white text-base font-semibold mb-2">
                        {tier.title}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed ${
                          tier.isLocked ? "text-white/80" : "text-white/80"
                        }`}
                      >
                        {tier.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleHighYieldExplore(tier.id, tier.title)}
                    disabled={tier.isLocked}
                    className={`mt-4 px-6 py-2.5 ${tier.buttonBg} ${tier.buttonText} rounded-full text-xs font-semibold transition-colors relative z-10 flex items-center gap-2 ${
                      tier.isLocked ? "cursor-not-allowed" : ""
                    }`}
                  >
                    {tier.isLocked && <LockKeyhole size={14} />}
                    <span>{getButtonText(tier.isLocked || false, true)}</span>
                  </button>

                  {/* Bottom Right Image */}
                  <img
                    src={tier.image}
                    alt={tier.title}
                    className={tier.imageClass}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation />

        {/* Help Drawer */}
        <HelpDrawer
          isOpen={showHelpDrawer}
          onClose={() => setShowHelpDrawer(false)}
          title={
            action === "deposit"
              ? "Deposit to Tiers"
              : action === "withdraw"
                ? "Withdraw from Tiers"
                : "Yield Tiers"
          }
          content={[
            "Explore different earning opportunities. Put your balance to work and earn rewards, subject to terms and conditions.",
          
          ]}
        />

        {/* Exit Grow Confirmation Drawer */}
        <ConfirmDrawer
          isOpen={showExitDrawer && !isExiting}
          onClose={() => setShowExitDrawer(false)}
          onConfirm={handleExitGrow}
          title=""
          message=" Exit Earn? You can always return later."
          confirmText="Exit Earn"
          cancelText="Stay"
          variant="warning"
          image="/grow1.png"
        />
      </div>
    </>
  );
};
