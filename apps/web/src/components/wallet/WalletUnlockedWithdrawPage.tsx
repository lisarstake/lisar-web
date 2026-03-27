import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, WalletCards } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import {
  RampDrawer,
  type RampTransactionDetails,
} from "@/components/general/RampDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { usePrices } from "@/hooks/usePrices";
import { rampService } from "@/services/ramp";
import { formatNumber } from "@/lib/formatters";

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
  const {
    virtualAccount,
    solanaWalletAddress,
    ethereumWalletAddress,
    refreshAllWalletData,
  } = useWallet();

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
  const tokenRateInNgn = useMemo(() => {
    const ngnPerUsd = prices.ngn || 0;
    if (!ngnPerUsd) return 0;
    return (prices.lpt || 0) * ngnPerUsd;
  }, [prices.lpt, prices.ngn]);

  const [error, setError] = useState("");
  const [showRampDrawer, setShowRampDrawer] = useState(false);
  const [rampDetails, setRampDetails] = useState<RampTransactionDetails | null>(
    null,
  );

  const resolveVirtualAccountBankCode = async (): Promise<string | null> => {
    if (!virtualAccount?.bankName) return null;
    const response = await rampService.getBanks();
    if (!response.success || !response.data?.length) return null;

    const normalize = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]/g, "");
    const target = normalize(virtualAccount.bankName);

    const exact = response.data.find((bank) => normalize(bank.name) === target);
    if (exact) return exact.code;

    const fuzzy = response.data.find((bank) => {
      const candidate = normalize(bank.name);
      return candidate.includes(target) || target.includes(candidate);
    });
    return fuzzy?.code || null;
  };

  const handleContinue = async () => {
    if (!fixedAmount || fixedAmount <= 0) {
      setError("No unlocked amount available.");
      return;
    }
    if (!unbondingLockId) {
      setError("Unlocked stake details are missing. Please try again.");
      return;
    }
    if (!tokenRateInNgn) {
      setError("Rate unavailable right now. Please try again.");
      return;
    }

    if (!virtualAccount?.accountNumber || !virtualAccount?.accountName) {
      setError("Create a Naira virtual account before converting.");
      return;
    }

    const bankCode = await resolveVirtualAccountBankCode();
    if (!bankCode) {
      setError("Could not resolve your Naira account bank code.");
      return;
    }

    const customerEmail = state.user?.email || "";
    const customerName = state.user?.full_name || "Lisar User";
    const fiatAmount = fixedAmount * tokenRateInNgn;

    setRampDetails({
      type: "sell",
      tokenAmount: fixedAmount,
      tokenName: "LPT",
      fiatAmount,
      fiatSymbol: "₦",
      fiatCurrency: "NGN",
      exchangeRate: tokenRateInNgn,
      fee: 0,
      processingTime: "1 minute",
      paymentMethodText: "To your Naira virtual account",
      cryptoAddress:
        ethereumWalletAddress || state.user?.wallet_address || solanaWalletAddress || null,
      bankCode,
      bankAccountNumber: virtualAccount.accountNumber,
      bankAccountName: virtualAccount.accountName,
      bankName: virtualAccount.bankName,
      customerEmail,
      customerName,
      lptWithdrawalMode: "unlocked",
      unbondingLockId,
    });
    setShowRampDrawer(true);
  };

  const fiatEstimate = fixedAmount * tokenRateInNgn;

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      <div className="flex items-center justify-between px-6 pt-8 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
        >
          <ArrowLeft className="text-white" size={22} />
        </button>
        <h1 className="text-lg font-medium">Withdraw to Naira</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide">
        <div className="pt-2 pb-4">
          <div className="bg-[#13170a] rounded-lg p-3 flex items-center gap-3 mt-2">
            <input
              type="text"
              value={formatNumber(fixedAmount)}
              readOnly
              className="flex-1 bg-transparent text-white text-lg font-medium focus:outline-none"
            />
          </div>
          <p className="text-gray-400 text-xs mt-2 pl-2">
            ≈ ₦
            {fiatEstimate.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="rounded-lg bg-[#13170a] p-4 mt-3">
          <h3 className="text-sm text-white/60 mb-0.5 flex items-center gap-1.5">
            <WalletCards size={16} /> LPT staked balance
          </h3>
          <div className="bg-[#13170a] rounded-lg border border-[#13170a]">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <span className="text-gray-100 text-sm font-medium">
                  {stakedLptBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })} LPT
                </span>
              </div>
            </div>
          </div>
        </div>

        {error ? <p className="mt-3 text-xs text-amber-300">{error}</p> : null}
      </div>

      <div className="px-6 py-3.5 bg-[#050505] pb-24">
        <button
          onClick={handleContinue}
          disabled={!fixedAmount || !unbondingLockId}
          className={`h-12 w-full rounded-full text-base font-semibold transition-colors ${
            fixedAmount > 0 && unbondingLockId
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>

      {rampDetails && (
        <RampDrawer
          isOpen={showRampDrawer}
          onClose={() => setShowRampDrawer(false)}
          details={rampDetails}
          onConfirm={async () => {
            await Promise.all([refreshAllWalletData(), refetchDelegation()]);
            navigate("/wallet");
          }}
        />
      )}

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
