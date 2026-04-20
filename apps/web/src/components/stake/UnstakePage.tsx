import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, WalletCards } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useOrchestrators } from "@/contexts/OrchestratorContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useAuth } from "@/contexts/AuthContext";
import { priceService } from "@/lib/priceService";
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
  const [lptAmount, setLptAmount] = useState("0");
  const [fiatEquivalent, setFiatEquivalent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { orchestrators } = useOrchestrators();
  const { userDelegation } = useDelegation();
  const { state } = useAuth();
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
  const userCurrency = state.user?.fiat_type || "NGN";
  const currencySymbol = priceService.getCurrencySymbol(userCurrency);

  useEffect(() => {
    const calculateFiat = async () => {
      const numericAmount = parseFloat(lptAmount.replace(/,/g, "")) || 0;
      if (numericAmount > 0) {
        const fiatValue = await priceService.convertLptToFiat(
          numericAmount,
          userCurrency
        );
        setFiatEquivalent(fiatValue);
      } else {
        setFiatEquivalent(0);
      }
    };
    calculateFiat();
  }, [lptAmount, userCurrency]);


  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAmountSelect = (amount: string) => {
    const numericAmount = parseFormattedNumber(amount);
    setLptAmount(numericAmount);
  };

  const handleProceed = async () => {
    const numericAmount = parseFloat(lptAmount.replace(/,/g, "")) || 0;

    if (numericAmount <= 0 || numericAmount > currentStake) {
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
        amount: lptAmount.replace(/,/g, ""),
      });

      if (response.success) {
        await refreshAllWalletData();
        setShowSuccessDrawer(true);
      } else {
        setErrorMessage("Sorry an error occurred and withdrawal didn't complete, please try again.");
        setShowErrorDrawer(true);
      }
    } catch (error) {
      setErrorMessage("Sorry an error occurred and withdrawal didn't complete, please try again.");
      setShowErrorDrawer(true);
    } finally {
      setIsProcessing(false);
    }
  };
  const numericLptAmount = parseFloat(lptAmount || "0");
  const activePercent = (() => {
    if (!currentStake || currentStake <= 0 || !Number.isFinite(numericLptAmount)) {
      return null;
    }
    const ratio = (numericLptAmount / currentStake) * 100;
    const clampedRatio = Math.min(100, Math.max(0, ratio));
    return presetPercents.reduce((closest, current) => {
      const currentDiff = Math.abs(current - clampedRatio);
      const closestDiff = Math.abs(closest - clampedRatio);
      return currentDiff < closestDiff ? current : closest;
    }, presetPercents[0]);
  })();

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <button
          onClick={handleBackClick}
          className="h-10 w-10 rounded-full bg-[#071510] flex items-center justify-center"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>

        <div className="w-8 h-8" />
        <div className="w-8 h-8" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide">
        {/* Amount Input Field */}
        <div className="pt-2 pb-4">
          <div className="bg-[#071510] rounded-lg p-3 flex items-center gap-3">
            <input
              type="text"
              value={lptAmount ? formatNumber(lptAmount) : ""}
              onChange={(e) => {
                const rawValue = parseFormattedNumber(e.target.value);
                let numericValue = rawValue.replace(/[^0-9.]/g, "");
                const parts = numericValue.split(".");
                if (parts.length > 2) {
                  numericValue = parts[0] + "." + parts.slice(1).join("");
                }
                setLptAmount(numericValue);
              }}
              placeholder="LPT"
              className="flex-1 bg-transparent text-white text-lg font-medium focus:outline-none"
            />

          </div>
          <p className="text-gray-400 text-xs mt-2 pl-2">
            ≈ {currencySymbol}
            {fiatEquivalent.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Predefined LPT Amounts */}
        <div className="pb-4">
          <div className="flex space-x-3">
            {presetPercents.map((percent) => {
              const amount = ((currentStake * percent) / 100).toFixed(6);
              const isActive = activePercent === percent && numericLptAmount > 0;
              return (
                <button
                  key={percent}
                  onClick={() => handleAmountSelect(amount)}
                  className={`flex-1 py-2.5 px-2 rounded-full text-sm font-medium transition-colors ${isActive
                    ? "bg-[#C7EF6B] text-black"
                    : "bg-[#071510] text-white/80 hover:bg-[#1a1f10]"
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
          <div className="rounded-lg bg-[#071510] p-4 mt-3">
            <h3 className="text-sm text-white/60 mb-0.5 flex items-center gap-1.5">
              <WalletCards size={16} /> Wallet balance
            </h3>
            <div className="bg-[#071510] rounded-lg border border-[#071510]">
              <div className="flex items-center space-x-3">

                <div className="flex-1">
                  <span className="text-gray-100 text-sm font-medium">
                    {currentStake.toLocaleString()} LPT
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proceed Button */}
      <div className="px-6 py-4 bg-[#050505] pb-24">
        <button
          onClick={handleProceed}
          disabled={
            !lptAmount ||
            parseFloat(lptAmount) > currentStake ||
            parseFloat(lptAmount) <= 0 ||
            isProcessing
          }
          className={`w-full py-3.5 rounded-full font-semibold text-lg transition-colors ${lptAmount &&
            parseFloat(lptAmount) <= currentStake &&
            parseFloat(lptAmount) > 0 &&
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
        title="Your money is on the way!"
        message="Your withdrawal request processed successfully and your money is on it's way."
      />
    </div>
  );
};
const presetPercents = [25, 50, 75, 100] as const;
