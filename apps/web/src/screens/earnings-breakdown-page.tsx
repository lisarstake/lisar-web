import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@/contexts/WalletContext";
import { useDelegation } from "@/contexts/DelegationContext";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { usePrices } from "@/hooks/usePrices";
import { priceService } from "@/lib/priceService";
import { X, Calendar, ChevronRight } from "lucide-react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function EarningsBreakdownPage() {
  const navigate = useNavigate();
  const { state } = useAuth();
  const {
    stablesBalance: contextStablesBalance,
    highyieldBalance: contextHighyieldBalance,
  } = useWallet();
  const { delegatorStakeProfile } = useDelegation();
  const { summary: stakingSummary, setMode } = usePortfolio();
  const { prices } = usePrices();

  const [currency, setCurrency] = useState<"NGN" | "USD">(
    (state.user?.fiat_type || "USD").toUpperCase() === "NGN" ? "NGN" : "USD",
  );
  const [selectedDate] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });

  const fiatSymbol = useMemo(
    () => priceService.getCurrencySymbol(currency),
    [currency],
  );

  const stablesBalance = contextStablesBalance || 0;
  const highyieldBalance = contextHighyieldBalance || 0;
  const stakedLpt = delegatorStakeProfile
    ? parseFloat(delegatorStakeProfile.currentStake || "0")
    : 0;

  const convertToFiat = (usdValue: number) => {
    if (currency === "NGN") return usdValue * (prices.ngn || 0);
    return usdValue;
  };

  const monthlyReturnUsd = useMemo(() => {
    let total = 0;
    if (stakingSummary?.monthlyEarnings) {
      total += stakingSummary.monthlyEarnings;
    }
    const savingsMonthly = (stablesBalance * (14 / 100)) / 12;
    total += savingsMonthly;
    return total;
  }, [stakingSummary?.monthlyEarnings, stablesBalance]);

  const monthlyReturnFiat = useMemo(
    () => convertToFiat(monthlyReturnUsd),
    [monthlyReturnUsd, currency, prices],
  );

  const savingsBalanceFiat = useMemo(
    () => convertToFiat(stablesBalance),
    [stablesBalance, currency, prices],
  );

  const growthBalanceUsd = useMemo(() => {
    const lptPrice = prices.lpt || 0;
    return (highyieldBalance + stakedLpt) * lptPrice;
  }, [highyieldBalance, stakedLpt, prices]);
  const growthBalanceFiat = useMemo(
    () => convertToFiat(growthBalanceUsd),
    [growthBalanceUsd, currency, prices],
  );

  const categories = [
    {
      id: "savings",
      label: "Savings",
      balance: savingsBalanceFiat,
      icon: (
        <div className="w-9 h-9 rounded-full bg-[#86B3F7]/15 flex items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#86B3F7]"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      ),
    },
    {
      id: "growth",
      label: "Growth",
      balance: growthBalanceFiat,
      icon: (
        <div className="w-9 h-9 rounded-full bg-[#C7EF6B]/15 flex items-center justify-center">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#C7EF6B]"
          >
            <path
              d="M12 2L2 7l10 5 10-5-10-5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ),
    },
  ];

  const monthLabel = `${MONTHS[selectedDate.month]} ${selectedDate.year}`;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="sticky top-0 z-10 bg-[#050505] border-b border-[#505050] px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#1a1a1a] transition-colors"
          >
            <X size={20} className="text-white/60" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrency("NGN")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                currency === "NGN"
                  ? "text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              NGN
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                currency === "USD"
                  ? "text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              USD
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/80">
            {monthLabel}
            <Calendar size={16} className="text-white/50" />
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="rounded-2xl p-5 bg-[#0f0f0f] border border-[#505050] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#22c55e]/5 rounded-full blur-2xl" />
          <div className="relative text-center">
            <p className="text-xl font-semibold text-[#4ade80]">
              {fiatSymbol}
              {monthlyReturnFiat.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-white/60 mt-1">
              Return in {MONTHS[selectedDate.month]}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setMode(cat.id === "savings" ? "savings" : "staking");
                navigate(
                  cat.id === "savings" ? "/wallet/savings" : "/wallet/staking",
                );
              }}
              className="w-full flex items-center gap-3 py-3.5 border-b border-[#505050] last:border-0 hover:bg-[#0a0a0a] transition-colors"
            >
              {cat.icon}
              <span className="flex-1 text-left text-sm font-medium text-white/90">
                {cat.label}
              </span>
              <span className="text-xs text-white/50">
                {fiatSymbol}
                {cat.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <ChevronRight size={18} className="text-white/40" />
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-[#0f0f0f] border border-[#505050]">
          <p className="text-xs text-white/60 mb-3">
            Earn even more by funding your plans
          </p>
          <button
            onClick={() => navigate("/wallet?open=deposit")}
            className="w-full py-2.5 rounded-lg bg-[#86B3F7] hover:bg-[#96C3F7] text-black text-sm font-medium transition-colors"
          >
            Add more cash
          </button>
        </div>
      </div>
    </div>
  );
}
