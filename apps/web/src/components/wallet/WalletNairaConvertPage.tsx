import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, WalletCards } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import {
  PajRampDrawer,
  type PajRampTransactionDetails,
} from "@/components/general/PajRampDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { useWallet } from "@/contexts/WalletContext";
import { useWalletCard } from "@/contexts/WalletCardContext";
import { usePrices } from "@/hooks/usePrices";
import { OnrampWebSDK } from "@onramp.money/onramp-web-sdk";
import { getFiatType } from "@/lib/onramp";
import { formatNumber, parseFormattedNumber } from "@/lib/formatters";

type ConvertMode = "deposit" | "withdraw";

const TOKEN_CHAIN: Record<string, string> = {
  USDC: "SOLANA",
  USDT: "SOLANA",
  LPT: "arbitrum",
};

export const WalletNairaConvertPage: React.FC = () => {
  const navigate = useNavigate();
  const { mode, walletType } = useParams<{
    mode: ConvertMode;
    walletType: string;
  }>();
  const safeMode: ConvertMode = mode === "withdraw" ? "withdraw" : "deposit";
  const safeWalletType = walletType === "staking" ? "staking" : "savings";
  const tokenSymbol = safeWalletType === "staking" ? "LPT" : "USDC";

  const { state } = useAuth();
  const { userDelegation } = useDelegation();
  const { displayCurrency, displayFiatSymbol } = useWalletCard();
  const { prices } = usePrices();
  const {
    stablesBalance,
    nairaBalance,
    virtualAccount,
    solanaWalletAddress,
    ethereumWalletAddress,
    refreshAllWalletData,
  } = useWallet();

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [showRampDrawer, setShowRampDrawer] = useState(false);
  const [rampDetails, setRampDetails] = useState<PajRampTransactionDetails | null>(
    null,
  );
  const onrampInstanceRef = useRef<OnrampWebSDK | null>(null);

  const nairaSourceBalance = nairaBalance || 0;
  const stakedLptBalance = useMemo(
    () => parseFloat(userDelegation?.bondedAmount || "0") || 0,
    [userDelegation?.bondedAmount],
  );
  const availableTokenBalance = useMemo(
    () =>
      safeWalletType === "staking" ? stakedLptBalance : stablesBalance || 0,
    [safeWalletType, stablesBalance, stakedLptBalance],
  );
  const sourceBalance =
    safeMode === "deposit" ? nairaSourceBalance : availableTokenBalance;
  const sourceBalanceLabel =
    safeMode === "deposit" ? "Naira balance" : `${safeWalletType} balance`;

  const tokenRateInNgn = useMemo(() => {
    const ngnPerUsd = prices.ngn || 0;
    if (!ngnPerUsd) return 0;
    if (tokenSymbol === "LPT") return (prices.lpt || 0) * ngnPerUsd;
    return ngnPerUsd;
  }, [prices.lpt, prices.ngn, tokenSymbol]);

  const sourceFiatBalance = useMemo(
    () =>
      safeMode === "deposit"
        ? nairaSourceBalance
        : availableTokenBalance * tokenRateInNgn,
    [safeMode, nairaSourceBalance, availableTokenBalance, tokenRateInNgn],
  );

  const sourceDisplayValue = useMemo(() => {
    if (safeMode === "deposit") {
      if (displayCurrency === "USD") return (nairaSourceBalance || 0) / Math.max(prices.ngn || 1, 1);
      return nairaSourceBalance || 0;
    }
    if (safeWalletType === "savings") {
      const usdValue = stablesBalance || 0;
      if (displayCurrency === "NGN") return usdValue * (prices.ngn || 0);
      return usdValue;
    }
    const usdValue = stakedLptBalance * (prices.lpt || 0);
    if (displayCurrency === "NGN") return usdValue * (prices.ngn || 0);
    return usdValue;
  }, [safeMode, safeWalletType, nairaSourceBalance, stablesBalance, stakedLptBalance, displayCurrency, prices.ngn, prices.lpt]);

  useEffect(() => {
    return () => {
      if (onrampInstanceRef.current) {
        try {
          onrampInstanceRef.current.close();
          refreshAllWalletData();
        } catch {}
      }
    };
  }, [refreshAllWalletData]);

  const handleContinue = async () => {
    const parsedAmount = Number(parseFormattedNumber(amount).trim());
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (!tokenRateInNgn) {
      setError("Rate unavailable right now. Please try again.");
      return;
    }

    const tokenAmount = safeMode === "withdraw" ? parsedAmount / tokenRateInNgn : 0;
    if (safeMode === "withdraw" && tokenAmount > availableTokenBalance) {
      setError(`Amount exceeds available ${tokenSymbol}`);
      return;
    }

    const customerEmail = state.user?.email || "";
    const customerName = state.user?.full_name || "Lisar User";

    if (safeMode === "deposit") {
      const fiatAmount = parsedAmount;
      const tokenAmount = fiatAmount / tokenRateInNgn;

      if (safeWalletType === "savings") {
        const cryptoAddress = solanaWalletAddress || null;
        if (!cryptoAddress) {
          setError("Wallet address not available. Please try again.");
          return;
        }

        setRampDetails({
          type: "buy",
          tokenAmount,
          tokenName: tokenSymbol,
          fiatAmount,
          fiatSymbol: "₦",
          fiatCurrency: "NGN",
          exchangeRate: tokenRateInNgn,
          fee: 0,
          cryptoAddress,
          customerEmail,
          customerName,
          mint: "",
          chain: TOKEN_CHAIN[tokenSymbol] || "solana",
        });
        setShowRampDrawer(true);
        return;
      }

      const walletAddress =
        ethereumWalletAddress || state.user?.wallet_address;

      if (!walletAddress) {
        setError("Wallet address not available. Please try again.");
        return;
      }

      const coinCode = tokenSymbol === "LPT" ? "lpt" : "usdc";
      const network = tokenSymbol === "LPT" ? "arbitrum" : "spl";
      const fiatType = getFiatType("NGN");

      try {
        const onramp = new OnrampWebSDK({
          appId: import.meta.env.VITE_ONRAMP_APP_ID,
          walletAddress,
          flowType: 1,
          fiatType,
          paymentMethod: 2,
          fiatAmount: parsedAmount,
          coinCode,
          network,
          theme: {
            lightMode: {
              baseColor: "#C7EF6B",
              inputRadius: "8px",
              buttonRadius: "8px",
            },
            darkMode: {
              baseColor: "#6A8F2A",
              inputRadius: "8px",
              buttonRadius: "8px",
            },
            default: "darkMode",
          },
          isRestricted: true,
        });

        onramp.on("WIDGET_EVENTS", async (event) => {
          if (
            event.type === "ONRAMP_WIDGET_CLOSE_REQUEST_CONFIRMED" ||
            event.type === "ONRAMP_WIDGET_CLOSE"
          ) {
            await refreshAllWalletData();
          }
        });

        onrampInstanceRef.current = onramp;
        onramp.show();
      } catch {
        setError("Failed to initialize payment widget. Please try again.");
      }
      return;
    }

    if (!virtualAccount?.accountNumber || !virtualAccount?.accountName) {
      setError("Create a Naira virtual account before converting.");
      return;
    }

    if (safeWalletType === "savings") {
      const fiatAmount = parsedAmount;

      setRampDetails({
        type: "sell",
        tokenAmount,
        tokenName: tokenSymbol,
        fiatAmount,
        fiatSymbol: "₦",
        fiatCurrency: "NGN",
        exchangeRate: tokenRateInNgn,
        fee: 0,
        cryptoAddress: solanaWalletAddress || null,
        bankAccountNumber: virtualAccount.accountNumber,
        bankAccountName: virtualAccount.accountName,
        bankName: virtualAccount.bankName,
        customerEmail,
        customerName,
        mint: "",
        chain: TOKEN_CHAIN[tokenSymbol] || "solana",
      });
      setShowRampDrawer(true);
      return;
    }

    const walletAddress =
      ethereumWalletAddress || state.user?.wallet_address;
    const fiatAmount = parsedAmount;

    try {
      const onramp = new OnrampWebSDK({
        appId: import.meta.env.VITE_ONRAMP_APP_ID,
        walletAddress: walletAddress || "",
        flowType: 2,
        coinCode: "lpt",
        network: "arbitrum",
        fiatAmount,
        fiatType: getFiatType("NGN"),
        theme: {
          lightMode: {
            baseColor: "#C7EF6B",
            inputRadius: "8px",
            buttonRadius: "8px",
          },
          darkMode: {
            baseColor: "#6A8F2A",
            inputRadius: "8px",
            buttonRadius: "8px",
          },
          default: "darkMode",
        },
        isRestricted: true,
      });

      onramp.on("WIDGET_EVENTS", async (event) => {
        if (
          event.type === "ONRAMP_WIDGET_CLOSE_REQUEST_CONFIRMED" ||
          event.type === "ONRAMP_WIDGET_CLOSE"
        ) {
          await refreshAllWalletData();
        }
      });

      onrampInstanceRef.current = onramp;
      onramp.show();
    } catch {
      setError("Failed to initialize offramp widget. Please try again.");
    }
  };

  const title =
    safeMode === "deposit" ? `Deposit with Naira` : `Withdraw to Naira`;
  const numericAmount = Number(parseFormattedNumber(amount).trim()) || 0;
  const hasExceededBalance = numericAmount > sourceFiatBalance;
  const activePercent = useMemo(() => {
    if (
      !sourceFiatBalance ||
      sourceFiatBalance <= 0 ||
      !Number.isFinite(numericAmount)
    ) {
      return null;
    }
    const ratio = (numericAmount / sourceFiatBalance) * 100;
    const clampedRatio = Math.min(100, Math.max(0, ratio));
    return presetPercents.reduce((closest, current) => {
      const currentDiff = Math.abs(current - clampedRatio);
      const closestDiff = Math.abs(closest - clampedRatio);
      return currentDiff < closestDiff ? current : closest;
    }, presetPercents[0]);
  }, [numericAmount, sourceBalance]);

  const handleAmountSelect = (percent: number) => {
    const nextAmount = sourceFiatBalance * (percent / 100);
    setAmount(nextAmount.toFixed(2));
    setError("");
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
        <h1 className="text-lg font-medium">{title}</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pb-28 scrollbar-hide">
        <div className="pt-2 pb-4">
          <div className="bg-[#151515] rounded-lg p-3 flex items-center gap-1 mt-2">
            <span className="text-white/50 text-lg font-medium">₦</span>
            <input
              type="text"
              value={amount ? formatNumber(amount) : ""}
              onChange={(e) => {
                const rawValue = parseFormattedNumber(e.target.value);
                let numericValue = rawValue.replace(/[^₦0-9.]/g, "");
                numericValue = numericValue.replace(/₦/g, "");
                const parts = numericValue.split(".");
                if (parts.length > 2) {
                  numericValue = `${parts[0]}.${parts.slice(1).join("")}`;
                }
                setAmount(numericValue);
                setError("");
              }}
              placeholder="0"
              className="flex-1 bg-transparent text-white text-lg font-medium focus:outline-none"
            />
          </div>
        </div>

        <div className="pb-4">
          <div className="flex space-x-3">
            {presetPercents.map((percent) => {
              const nextAmount = (sourceFiatBalance * (percent / 100)).toFixed(2);
              const isActive = activePercent === percent && numericAmount > 0;
              return (
                <button
                  key={percent}
                  onClick={() => handleAmountSelect(percent)}
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

        <div className="rounded-lg bg-[#151515] p-4 mt-3">
          <h3 className="text-sm text-white/60 mb-0.5 flex items-center gap-1.5">
            <WalletCards size={16} /> {sourceBalanceLabel}
          </h3>
          <div className="bg-[#151515] rounded-lg border border-[#151515]">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <span className="text-gray-100 text-sm font-medium">
                  {displayFiatSymbol}{sourceDisplayValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {hasExceededBalance ? (
          <p className="mt-3 text-xs text-amber-300">
            Amount exceeds available{" "}
            {safeMode === "deposit" ? "NGN" : tokenSymbol} balance.
          </p>
        ) : null}

        {error ? <p className="mt-2 text-xs text-amber-300">{error}</p> : null}
      </div>

      <div className="px-6 py-3.5 bg-[#050505] pb-24">
        <button
          onClick={handleContinue}
          disabled={numericAmount <= 0 || hasExceededBalance}
          className={`h-12 w-full rounded-full text-base font-semibold transition-colors ${
            numericAmount > 0 && !hasExceededBalance
              ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
              : "bg-[#636363] text-white cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>

      {rampDetails && (
        <PajRampDrawer
          isOpen={showRampDrawer}
          onClose={() => setShowRampDrawer(false)}
          details={rampDetails}
          onConfirm={async () => {
            await refreshAllWalletData();
            navigate("/wallet");
          }}
        />
      )}

      <BottomNavigation currentPath="/wallet" />
    </div>
  );
};
const presetPercents = [25, 50, 75, 100] as const;
