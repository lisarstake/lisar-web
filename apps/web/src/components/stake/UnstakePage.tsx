import React, { useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, WalletCards } from "lucide-react";
import toast from "react-hot-toast";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletCard } from "@/contexts/WalletCardContext";
import { usePrices } from "@/hooks/usePrices";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";
import { delegationService } from "@/services";
import { useWallet } from "@/contexts/WalletContext";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";
import { SuccessDrawer } from "@/components/general/SuccessDrawer";

export const UnstakePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { validatorId } = useParams<{ validatorId: string }>();
  const locationState = location.state as { availableBalance?: number } | null;
  const [fiatAmount, setFiatAmount] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { orchestrators } = useOrchestrators();
  const { userDelegation } = useDelegation();
  const { state } = useAuth();
  const { displayCurrency, displayFiatSymbol } = useWalletCard();
  const { prices } = usePrices();
  const { refreshAllWalletData } = useWallet();

  const delegatedStake =
    userDelegation && userDelegation.delegate.id === validatorId
      ? parseFloat(userDelegation.bondedAmount || "0")
      : 0;
  const currentStake =
    typeof locationState?.availableBalance === "number"
      ? locationState.availableBalance
      : delegatedStake;
  const hasStakeWithValidator = currentStake > 0;

  const balanceFiat = useMemo(() => {
    const lptUsd = prices.lpt || 0;
    const usdValue = currentStake * lptUsd;
    if (displayCurrency === "NGN") return usdValue * (prices.ngn || 0);
    return usdValue;
  }, [currentStake, prices.lpt, prices.ngn, displayCurrency]);

  const computedLptAmount = useMemo(() => {
    const numericFiat = parseFloat(fiatAmount.replace(/,/g, "")) || 0;
    if (numericFiat <= 0) return 0;
    const lptUsd = prices.lpt || 0;
    if (!lptUsd) return 0;
    if (displayCurrency === "NGN")
      return numericFiat / (lptUsd * (prices.ngn || 1));
    return numericFiat / lptUsd;
  }, [fiatAmount, displayCurrency, prices.lpt, prices.ngn]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAmountSelect = (amount: string) => {
    const numericAmount = parseFormattedNumber(amount);
    setFiatAmount(numericAmount);
  };

  const handleProceed = async () => {
    if (computedLptAmount <= 0 || computedLptAmount > currentStake) {
      setErrorMessage("Please enter a valid amount to withdraw.");
      setShowErrorDrawer(true);
      return;
    }

    if (!state.user?.wallet_id || !state.user?.wallet_address) {
      setErrorMessage("Wallet information is missing. Please try again.");
      setShowErrorDrawer(true);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await delegationService.unbond({
        walletId: state.user.wallet_id,
        walletAddress: state.user.wallet_address,
        amount: computedLptAmount.toString(),
      });

      if (response.success) {
        await refreshAllWalletData();
        toast.success(
          "Your unbonding is being processed. It will be available for withdrawal in ~7 days. Track progress via the info (i) icon on the staking wallet page.",
          { duration: 6000 },
        );
        setShowSuccessDrawer(true);
      } else {
        setErrorMessage(
          "Sorry an error occurred and withdrawal didn't complete, please try again.",
        );
        setShowErrorDrawer(true);
      }
    } catch (error) {
      setErrorMessage(
        "Sorry an error occurred and withdrawal didn't complete, please try again.",
      );
      setShowErrorDrawer(true);
    } finally {
      setIsProcessing(false);
    }
  };
  const numericFiatAmount = parseFloat(fiatAmount || "0");
  const activePercent = (() => {
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
  })();

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
        <h1 className="text-lg font-medium">Redeem</h1>
        <div className="w-10" />
      </div>

      {/* Scrollable Content */}
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

        {/* Predefined LPT Amounts */}
        <div className="pb-4">
          <div className="flex space-x-3">
            {presetPercents.map((percent) => {
              const amount = ((balanceFiat * percent) / 100).toFixed(2);
              const isActive =
                activePercent === percent && numericFiatAmount > 0;
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
        {hasStakeWithValidator && (
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
                {currentStake.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}{" "}
                LPT
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Proceed Button */}
      <div className="px-6 py-4 bg-[#050505] pb-24">
        <button
          onClick={handleProceed}
          disabled={
            !fiatAmount ||
            computedLptAmount > currentStake ||
            computedLptAmount <= 0 ||
            isProcessing
          }
          className={`w-full h-12 rounded-full font-medium text-lg transition-colors ${
            fiatAmount &&
            computedLptAmount <= currentStake &&
            computedLptAmount > 0 &&
            !isProcessing
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          {isProcessing ? "Processing.." : "Withdraw"}
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      <ErrorDrawer
        isOpen={showErrorDrawer}
        onClose={() => setShowErrorDrawer(false)}
        title="Sorry, an error occurred"
        message={errorMessage}
      />

      <SuccessDrawer
        isOpen={showSuccessDrawer}
        onClose={() => {
          setShowSuccessDrawer(false);
          navigate("/wallet/staking");
        }}
        title="Unbonding initiated"
        message="Your request to unbond LPT is being processed. Your tokens will be available for withdrawal in approximately 7 days. You can track the progress by tapping the info (i) icon on the staking wallet page."
      />
    </div>
  );
};
const presetPercents = [25, 50, 75, 100] as const;
