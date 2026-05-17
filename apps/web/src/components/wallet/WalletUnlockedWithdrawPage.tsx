import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LoaderCircle, WalletCards } from "lucide-react";
import toast from "react-hot-toast";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useWalletCard } from "@/contexts/WalletCardContext";
import { usePrices } from "@/hooks/usePrices";
import { delegationService } from "@/services";
import { formatNumber } from "@/lib/formatters";
import { ErrorDrawer } from "@/components/general/ErrorDrawer";

type WithdrawLocationState = {
  unlockedAmount?: number;
  unbondingLockId?: number;
} | null;

export const WalletUnlockedWithdrawPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAuth();
  const { delegatorStakeProfile, refetch: refetchDelegation } = useDelegation();
  const { prices } = usePrices();
  const { displayCurrency, displayFiatSymbol } = useWalletCard();
  const { refreshAllWalletData } = useWallet();

  const locationState = location.state as WithdrawLocationState;

  const stakedLptBalance = useMemo(
    () => parseFloat(delegatorStakeProfile?.currentStake || "0") || 0,
    [delegatorStakeProfile?.currentStake],
  );

  const fixedAmount = useMemo(() => {
    const amount = locationState?.unlockedAmount;
    return Number.isFinite(amount) && amount && amount > 0 ? amount : 0;
  }, [locationState?.unlockedAmount]);

  const unbondingLockId = locationState?.unbondingLockId;

  const fiatEquivalent = useMemo(() => {
    const lptUsd = prices.lpt || 0;
    const usdValue = fixedAmount * lptUsd;
    if (displayCurrency === "NGN") return usdValue * (prices.ngn || 0);
    return usdValue;
  }, [fixedAmount, prices.lpt, prices.ngn, displayCurrency]);

  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClaim = async () => {
    if (!fixedAmount || fixedAmount <= 0) {
      setError("No unlocked amount available.");
      return;
    }
    if (!unbondingLockId) {
      setError("Unlocked stake details are missing. Please try again.");
      return;
    }
    if (!state.user?.wallet_id || !state.user?.wallet_address) {
      setError("Wallet information is missing. Please try again.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const response = await delegationService.withdrawStake({
        walletId: state.user.wallet_id,
        walletAddress: state.user.wallet_address,
        unbondingLockId,
      });

      if (response.success) {
        await refreshAllWalletData();
        await refetchDelegation();
        toast.success(
          `Successfully claimed ${formatNumber(fixedAmount)} LPT to your wallet.`,
        );
        navigate("/wallet");
      } else {
        setError(response.error || "Failed to claim earnings. Please try again.");
      }
    } catch {
      setError("Failed to claim earnings. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-full bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <h1 className="text-lg font-medium">Claim </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pb-28 scrollbar-hide">
        <div className="pt-2 pb-4">
          <div className="bg-[#151515] rounded-lg p-3 flex items-center gap-3 mt-2">
            <span className="text-white/50 text-lg font-medium mr-1">{displayFiatSymbol}</span>
            <input
              type="text"
              value={fiatEquivalent.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              readOnly
              className="flex-1 bg-transparent text-white text-lg font-medium focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-lg bg-[#151515] p-4 mt-3">
          <h3 className="text-sm text-white/60 mb-0.5 flex items-center gap-1.5">
            <WalletCards size={16} /> Available to claim
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-100 text-sm font-medium">
              {displayFiatSymbol}
              {fiatEquivalent.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-gray-400 text-xs">
              {fixedAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}{" "}
              LPT
            </span>
          </div>
        </div>

        {error ? <p className="mt-3 text-xs text-amber-300">{error}</p> : null}
      </div>

      <div className="px-6 py-3.5 bg-[#050505] pb-24">
        <button
          onClick={handleClaim}
          disabled={!fixedAmount || !unbondingLockId || isProcessing}
          className={`h-12 w-full rounded-full text-base font-medium transition-colors ${
            fixedAmount > 0 && unbondingLockId && !isProcessing
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle size={16} className="animate-spin" />
              Processing...
            </span>
          ) : (
            "Claim"
          )}
        </button>
      </div>

      <ErrorDrawer
        isOpen={Boolean(error)}
        onClose={() => setError("")}
        title="Failed to claim earnings"
        message={error}
      />

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
