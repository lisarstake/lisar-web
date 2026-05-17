import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  EyeClosed,
  EyeIcon,
  LoaderCircle,
  WalletCards,
} from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import { SuccessDrawer } from "@/components/general/SuccessDrawer";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { usePortfolio, type StakeEntry } from "@/contexts/PortfolioContext";
import { useWalletCard } from "@/contexts/WalletCardContext";
import { usePrices } from "@/hooks/usePrices";
import { perenaService, mapleService } from "@/services";
import { authService } from "@/services/auth";
import { useWallet } from "@/contexts/WalletContext";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";
import { usePageTracking } from "@/hooks/usePageTracking";

export const RedeemPage: React.FC = () => {
  // Track redeem page visit
  usePageTracking("Redeem Page", { page_type: "redeem" });
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as {
    entry?: StakeEntry;
    walletType?: string;
  } | null;

  const selectedEntry = locationState?.entry;
  const destinationWalletType =
    locationState?.walletType === "staking" ? "staking" : "savings";
  const isMaple = selectedEntry?.name.toLowerCase().includes("maple");
  const isPerena = selectedEntry?.name.toLowerCase().includes("perena");

  const [fiatAmount, setFiatAmount] = useState("0");
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const { state } = useAuth();
  const {
    refreshAllWalletData,
    ethereumWalletAddress,
    solanaWalletAddress,
    ethereumWalletId,
    solanaWalletId,
  } = useWallet();
  const { refetch: refetchTransactions } = useTransactions();
  const { refetch: refetchPortfolio } = usePortfolio();
  const { displayCurrency, displayFiatSymbol } = useWalletCard();
  const { prices } = usePrices();

  const maxRedeemable = selectedEntry?.yourStake || 0;

  const balanceFiat = useMemo(() => {
    if (displayCurrency === "NGN") return maxRedeemable * (prices.ngn || 0);
    return maxRedeemable;
  }, [maxRedeemable, displayCurrency, prices.ngn]);

  const computedUsdcAmount = useMemo(() => {
    const numericFiat = parseFloat(fiatAmount.replace(/,/g, "")) || 0;
    if (numericFiat <= 0) return 0;
    if (displayCurrency === "NGN") return numericFiat / (prices.ngn || 1);
    return numericFiat;
  }, [fiatAmount, displayCurrency, prices.ngn]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAmountSelect = (amount: string) => {
    const numericAmount = parseFormattedNumber(amount);
    setFiatAmount(numericAmount);
  };

  const handleMaxClick = () => {
    setFiatAmount(balanceFiat.toString());
  };

  const handleProceed = async () => {
    if (computedUsdcAmount <= 0) {
      setErrorMessage("Please enter a valid amount to withdraw.");
      setShowErrorDrawer(true);
      return;
    }

    if (computedUsdcAmount > maxRedeemable) {
      setErrorMessage(
        `Maximum withdrawable amount is ${displayFiatSymbol}${balanceFiat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
      );
      setShowErrorDrawer(true);
      return;
    }

    setConfirmPassword("");
    setConfirmError("");
    setShowConfirmDrawer(true);
  };

  const executeWithdraw = async () => {
    if (!selectedEntry) {
      setErrorMessage("No position selected. Please try again.");
      setShowErrorDrawer(true);
      return;
    }

    if (computedUsdcAmount <= 0) {
      setErrorMessage("Please enter a valid amount to withdraw.");
      setShowErrorDrawer(true);
      return;
    }

    if (computedUsdcAmount > maxRedeemable) {
      setErrorMessage(
        `Maximum withdrawable amount is ${displayFiatSymbol}${balanceFiat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
      );
      setShowErrorDrawer(true);
      return;
    }

    if (isMaple) {
      if (!ethereumWalletAddress || !ethereumWalletId) {
        setErrorMessage(
          "Ethereum wallet not found. Please create a wallet first.",
        );
        setShowErrorDrawer(true);
        return;
      }

      const maplePoolId = import.meta.env.VITE_MAPLE_USDC_POOL_ID;
      const positionsResp = await mapleService.getPositions(
        ethereumWalletAddress,
        maplePoolId,
      );

      if (
        !positionsResp.success ||
        !positionsResp.data?.hasPositions ||
        !positionsResp.data.positions ||
        positionsResp.data.positions.length === 0
      ) {
        setErrorMessage("No positions found. Please try again.");
        setShowErrorDrawer(true);
        return;
      }

      const totalShares = positionsResp.data.positions.reduce(
        (sum, position) => {
          const shares = parseFloat(position.redeemableSharesRaw || "0");
          return sum + (isNaN(shares) ? 0 : shares);
        },
        0,
      );

      if (totalShares <= 0) {
        setErrorMessage("No shares available for withdrawal.");
        setShowErrorDrawer(true);
        return;
      }

      const sharesToRedeem = computedUsdcAmount.toString();
      const redeemResp = await mapleService.requestRedeem({
        walletId: ethereumWalletId,
        walletAddress: ethereumWalletAddress,
        poolAddress: maplePoolId,
        shares: sharesToRedeem,
      });

      if (!redeemResp.success) {
        setErrorMessage(
          redeemResp.error || "Failed to request withdrawal. Please try again.",
        );
        setShowErrorDrawer(true);
        return;
      }
    } else if (isPerena) {
      if (!solanaWalletAddress || !solanaWalletId) {
        setErrorMessage(
          "Solana wallet not found. Please create a wallet first.",
        );
        setShowErrorDrawer(true);
        return;
      }

      const burnResp = await perenaService.burn({
          walletId: solanaWalletId,
          walletAddress: solanaWalletAddress,
          usdStarAmount: computedUsdcAmount,
        });

      if (!burnResp.success) {
        setErrorMessage(
          burnResp.error || "Failed to withdraw. Please try again.",
        );
        setShowErrorDrawer(true);
        return;
      }
    } else {
      setErrorMessage("Invalid position type. Please try again.");
      setShowErrorDrawer(true);
      return;
    }

    setSuccessMessage(
      "You've withdrawn successfully from your yield balance and your balance has been updated.",
    );
    setShowSuccessDrawer(true);
    await Promise.all([
      refreshAllWalletData(),
      refetchPortfolio(),
      refetchTransactions(),
    ]);
  };

  const handleWithdraw = async () => {
    if (!state.user?.email) {
      setConfirmError("No user email found.");
      return;
    }
    if (!confirmPassword) {
      setConfirmError("Please enter your password.");
      return;
    }

    setConfirmError("");
    setIsVerifyingPassword(true);
    setIsRedeeming(true);

    try {
      const loginResp = await authService.signin({
        email: state.user.email,
        password: confirmPassword,
      });

      if (!loginResp.success) {
        setConfirmError(loginResp.message || "Incorrect password.");
        setIsVerifyingPassword(false);
        setIsRedeeming(false);
        return;
      }

      setShowConfirmDrawer(false);
      await executeWithdraw();
    } catch (error) {
      setConfirmError("An error occurred. Please try again.");
    } finally {
      setIsVerifyingPassword(false);
      setIsRedeeming(false);
    }
  };

  const numericFiatAmount = parseFloat(fiatAmount.replace(/,/g, "")) || 0;
  const hasExceededMax = computedUsdcAmount > maxRedeemable;
  const activePercent = useMemo(() => {
    if (
      !balanceFiat ||
      balanceFiat <= 0 ||
      !Number.isFinite(numericFiatAmount)
    ) {
      return null;
    }
    const ratio = (numericFiatAmount / balanceFiat) * 100;
    const clampedRatio = Math.min(100, Math.max(0, ratio));
    return presetPercents.reduce((closest, current) => {
      const currentDiff = Math.abs(current - clampedRatio);
      const closestDiff = Math.abs(closest - clampedRatio);
      return currentDiff < closestDiff ? current : closest;
    }, presetPercents[0]);
  }, [balanceFiat, numericFiatAmount]);

  if (!selectedEntry) {
    return (
      <div className="min-h-full bg-[#050505] text-white flex flex-col items-center justify-center">
        <p className="text-white/70">No position selected</p>
        <button
          onClick={handleBackClick}
          className="mt-4 text-[#86B3F7] hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-2">
        <button
          onClick={handleBackClick}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <h1 className="text-lg font-medium">Redeem Balance</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pb-28 scrollbar-hide">
        {/* Amount Input Field */}
        <div className="pt-2 pb-4">
          <div className="bg-[#151515] rounded-lg p-3 flex items-center gap-3">
            <span className="text-white/50 text-lg font-medium">{displayFiatSymbol}</span>
            <input
              type="text"
              value={fiatAmount ? formatNumber(fiatAmount) : ""}
              onChange={(e) => {
                const rawValue = parseFormattedNumber(e.target.value);
                let numericValue = rawValue.replace(/[^0-9.]/g, "");
                const parts = numericValue.split(".");
                if (parts.length > 2) {
                  numericValue = parts[0] + "." + parts.slice(1).join("");
                }
                setFiatAmount(numericValue);
              }}
              placeholder={displayFiatSymbol}
              className="flex-1 bg-transparent text-white text-lg font-medium focus:outline-none"
            />
          </div>
        </div>

        {/* Predefined USDC Amounts */}
        <div className="pb-4">
          <div className="flex space-x-3">
            {presetPercents.map((percent) => {
              const amount = (balanceFiat * (percent / 100)).toFixed(2);
              const isActive = activePercent === percent && numericFiatAmount > 0;
              return (
                <button
                  key={percent}
                  onClick={() => handleAmountSelect(amount)}
                  className={`flex-1 py-2.5 px-2 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#C7EF6B] text-black"
                      : "bg-[#151515] text-white/80 hover:bg-[#1a1f10]"
                  }`}
                >
                  {percent}%
                </button>
              );
            })}
          </div>
        </div>

        {/* Balance */}
        <div className="rounded-lg bg-[#151515] p-4 mt-3">
          <h3 className="text-sm text-white/60 mb-0.5 flex items-center gap-1.5">
            <WalletCards size={16} /> Wallet balance
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-100 text-sm font-medium">
              {displayFiatSymbol}
              {balanceFiat.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-gray-400 text-xs">
              {(maxRedeemable ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              USDC
            </span>
          </div>
        </div>
      </div>

      {/* Proceed Button - Fixed at bottom */}
      <div className="px-6 py-3.5 bg-[#050505] pb-24">
        <button
          onClick={handleProceed}
          disabled={
            !fiatAmount ||
            computedUsdcAmount <= 0 ||
            isRedeeming ||
            hasExceededMax
          }
          className={`w-full py-3 rounded-full font-semibold text-lg transition-colors ${
            fiatAmount &&
            computedUsdcAmount > 0 &&
            !isRedeeming &&
            !hasExceededMax
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          {isRedeeming ? (
            <span className="flex items-center justify-center gap-2">
              <LoaderCircle className="animate-spin h-5 w-5 text-white" />
              Processing..
            </span>
          ) : (
            "Withdraw"
          )}
        </button>
      </div>

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        title="Something went wrong"
        message={errorMessage}
      />

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => {
          setShowSuccessDrawer(false);
          navigate(`/wallet/${destinationWalletType}`);
        }}
        title="Withdrawal Successful!"
        message={successMessage}
      />

      <Drawer
        open={showConfirmDrawer}
        onOpenChange={(open) => !isRedeeming && setShowConfirmDrawer(open)}
      >
        <DrawerContent className="bg-[#050505] border-[#505050]">
          <DrawerHeader>
            <DrawerTitle className="text-lg font-medium text-white text-left">
              Confirm withdrawal
            </DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 py-1">
            <p className="text-sm text-white/80">
              You are about to withdraw{" "}
              {displayFiatSymbol}
              {parseFloat(fiatAmount.replace(/,/g, "") || "0").toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {isMaple
                ? " from your yield balance. Please enter your password to confirm action"
                : isPerena
                  ? " from your yield balance. Please enter your password to confirm action"
                  : ""}
              .
            </p>
            {/* <p className="text-sm text-white/60">
              Enter your account password to authorize this withdrawal.
            </p> */}

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmError("");
                  }}
                  placeholder="Enter your password"
                  className="w-full pr-12 px-4 py-3 bg-[#151515] border border-[#505050] rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#C7EF6B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeIcon className="w-5 h-5" />
                  ) : (
                    <EyeClosed className="w-5 h-5" />
                  )}
                </button>
              </div>
              {confirmError && (
                <p className="text-red-500 text-sm mt-2 pl-1">{confirmError}</p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isRedeeming || isVerifyingPassword}
                className={`flex-1 h-12 rounded-full font-semibold transition-colors ${
                  isRedeeming || isVerifyingPassword
                    ? "bg-[#636363] text-white cursor-not-allowed"
                    : "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                }`}
              >
                {isRedeeming || isVerifyingPassword ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoaderCircle className="animate-spin h-5 w-5 text-white" />
                    Processing..
                  </span>
                ) : (
                  "Withdraw"
                )}
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};
const presetPercents = [25, 50, 75, 100] as const;
