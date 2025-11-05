/**
 * Metrics Cards Component
 */

import React, { useMemo } from "react";
import { DashboardSummary } from "@/services/dashboard/types";

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
  // Format metrics from summary data - show "-" when empty or error
  const metrics = useMemo(() => {
    const emptyValue = "-";
    const hasError = !!error;
    const hasSummary = !!summary;

    return [
      {
        title: "Total Fiat Converted",
        value: hasError || !hasSummary
          ? emptyValue
          : summary.totalNgNConverted.toLocaleString(),
        currency: hasError || !hasSummary ? undefined : "₦",
      },
      {
        title: "Total Delegators",
        value: hasError || !hasSummary
          ? emptyValue
          : summary.totalDelegators.toLocaleString(),
      },
      {
        title: "Total Delegated",
        value: hasError || !hasSummary
          ? emptyValue
          : summary.totalLptDelegated.toLocaleString(),
      },
      {
        title: "Total Orchestrators",
        value: hasError || !hasSummary
          ? emptyValue
          : summary.totalValidators.toLocaleString(),
      },
    ];
  }, [summary, error]);

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
