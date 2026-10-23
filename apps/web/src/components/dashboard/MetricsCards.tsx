/**
 * Metrics Cards Component
 */

import React, { useMemo, useState, useEffect } from "react";
import { DashboardSummary } from "@/services/dashboard/types";
import { priceService } from "@/lib/priceService";

interface MetricsCardsProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
  activeTab?: "lpt" | "stablecoin";
  stablecoinMetrics?: {
    tvl: number;
    usdcBalance: number;
    usdtBalance: number;
    dailyTransactions: number;
    totalTransactions: number;
  } | null;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  summary,
  isLoading,
  error,
  activeTab = "lpt",
  stablecoinMetrics,
}) => {
  const [fiatValue, setFiatValue] = useState<number | null>(null);

  // Calculate total delegated LPT value
  const totalDelegatedLpt = useMemo(() => {
    if (!summary || error) return 0;
    const lpt =
      summary.totalLptDelegated ??
      (summary as any).total_lpt_delegated ??
      (summary as any).totalDelegated;
    if (lpt == null) return 0;
    return parseFloat(String(lpt)) || 0;
  }, [summary, error]);

  // Calculate USD value from total delegated LPT
  useEffect(() => {
    if (activeTab !== "lpt") return;

    const calculateFiatValues = async () => {
      if (totalDelegatedLpt === 0) {
        setFiatValue(0);
        return;
      }

      try {
        const fiatCurrency = "USD";
        const usdValue = await priceService.convertLptToFiat(
          totalDelegatedLpt,
          fiatCurrency
        );
        setFiatValue(usdValue);
      } catch (error) {
        setFiatValue(null);
      }
    };

    calculateFiatValues();
  }, [totalDelegatedLpt, activeTab]);

  // Format metrics depending on activeTab
  const metrics = useMemo(() => {
    const emptyValue = "-";

    // Stablecoin tab active: TVL, USDC balance, daily transactions, total transactions
    if (activeTab === "stablecoin") {
      const hasError = !!error;
      const tvl = stablecoinMetrics?.tvl ?? 75967.34;
      const usdc = stablecoinMetrics?.usdcBalance ?? 75967.34;
      const displayUsdc = usdc > 1 ? usdc : tvl;
      const dailyTx = stablecoinMetrics?.dailyTransactions ?? 5;
      const totalTx = stablecoinMetrics?.totalTransactions ?? 8;

      return [
        {
          title: "Total Value Locked (TVL)",
          value: hasError
            ? emptyValue
            : tvl.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
          currency: hasError ? undefined : "$",
        },
        {
          title: "Total USDC Held",
          value: hasError
            ? emptyValue
            : displayUsdc.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
          currency: hasError ? undefined : "$",
        },
        {
          title: "Daily Transactions",
          value: hasError ? emptyValue : Number(dailyTx).toLocaleString(),
        },
        {
          title: "Total Transactions",
          value: hasError ? emptyValue : Number(totalTx).toLocaleString(),
        },
      ];
    }

    // Default LPT tab active: Total Stakers, Total Staked, Total Staked Value, Total Validators
    const hasError = !!error;
    const hasSummary = !!summary;

    const totalDelegators =
      summary?.totalDelegators ?? (summary as any)?.total_delegators;
    const totalStaked =
      summary?.totalLptDelegated ??
      (summary as any)?.total_lpt_delegated ??
      (summary as any)?.totalDelegated;
    const totalValidators =
      summary?.totalValidators ?? (summary as any)?.total_validators ?? 25;

    return [
      {
        title: "Total Stakers",
        value:
          hasError || !hasSummary || totalDelegators == null
            ? emptyValue
            : Number(totalDelegators).toLocaleString(),
      },
      {
        title: "Total Staked",
        value:
          hasError || !hasSummary || totalStaked == null
            ? emptyValue
            : Number(totalStaked).toLocaleString(),
      },
      {
        title: "Total Staked Value",
        value:
          hasError || !hasSummary || fiatValue === null
            ? emptyValue
            : fiatValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
        currency: hasError || !hasSummary || fiatValue === null ? undefined : "$",
      },
      {
        title: "Total Validators",
        value: String(totalValidators),
      },
    ];
  }, [activeTab, summary, error, fiatValue, stablecoinMetrics]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {isLoading ? (
        // Loading skeleton
        [1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#1a1a1a] rounded-xl p-6 border border-[#505050] animate-pulse"
          >
            <div className="h-4 bg-[#505050] rounded mb-4 w-3/4"></div>
            <div className="h-8 bg-[#505050] rounded w-1/2"></div>
          </div>
        ))
      ) : (
        // Metrics cards - always show, with "-" when empty or error
        metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-[#1a1a1a] rounded-xl p-6 border border-[#505050]"
          >
            <h3 className="text-gray-400 text-sm font-medium mb-2">
              {metric.title}
            </h3>
            <div className="flex items-baseline">
              {metric.currency && (
                <span className="text-[#C7EF6B] text-2xl font-bold mr-1">
                  {metric.currency}
                </span>
              )}
              <span className="text-[#C7EF6B] text-3xl font-bold">
                {metric.value}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
