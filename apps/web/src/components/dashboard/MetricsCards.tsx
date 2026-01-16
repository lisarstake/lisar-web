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
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  summary,
  isLoading,
  error,
}) => {
  const [fiatValue, setFiatValue] = useState<number | null>(null);

  // Calculate total delegated LPT value
  const totalDelegatedLpt = useMemo(() => {
    if (!summary || error) return 0;
    return parseFloat(summary.totalLptDelegated.toString()) || 0;
  }, [summary, error]);

  // Calculate USD value from total delegated LPT
  useEffect(() => {
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
  }, [totalDelegatedLpt]);

  // Format metrics from summary data - show "-" when empty or error
  const metrics = useMemo(() => {
    const emptyValue = "-";
    const hasError = !!error;
    const hasSummary = !!summary;

    return [
      {
        title: "Total Stakers",
        value: hasError || !hasSummary
          ? emptyValue
          : summary.totalDelegators.toLocaleString(),
      },
      {
        title: "Total Staked",
        value: hasError || !hasSummary
          ? emptyValue
          : summary.totalLptDelegated.toLocaleString(),
      },
      {
        title: "Total Staked Value",
        value: hasError || !hasSummary || fiatValue === null
          ? emptyValue
          : fiatValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
        currency: hasError || !hasSummary || fiatValue === null ? undefined : "$",
      },
      {
        title: "Total Validators",
        value: '25',
      },
    ];
  }, [summary, error, fiatValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {isLoading ? (
        // Loading skeleton
        [1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] animate-pulse"
          >
            <div className="h-4 bg-[#2a2a2a] rounded mb-4 w-3/4"></div>
            <div className="h-8 bg-[#2a2a2a] rounded w-1/2"></div>
          </div>
        ))
      ) : (
        // Metrics cards - always show, with "-" when empty or error
        metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]"
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
