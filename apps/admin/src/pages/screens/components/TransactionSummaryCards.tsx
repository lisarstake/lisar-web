import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionStats } from "@/services/transactions/types";

const SummaryCard: React.FC<{
  value: string | null;
  label: string;
  isLoading?: boolean;
}> = ({ value, label, isLoading = false }) => (
  <Card className="bg-white">
    <CardContent className="p-6">
      {isLoading ? (
        <Skeleton className="h-9 w-24 mb-3" />
      ) : (
        <p className="text-2xl font-semibold text-gray-900 mb-1">
          {value || "-"}
        </p>
      )}
      <p className="text-sm text-gray-600">{label}</p>
    </CardContent>
  </Card>
);

const SummaryCardSkeleton: React.FC = () => (
  <Card className="bg-white">
    <CardContent className="p-6">
      <Skeleton className="h-9 w-24 mb-3" />
      <Skeleton className="h-4 w-32" />
    </CardContent>
  </Card>
);

const formatAmount = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface TransactionSummaryCardsProps {
  transactionStats: TransactionStats | null;
  isLoading: boolean;
}

export const TransactionSummaryCards: React.FC<TransactionSummaryCardsProps> = ({
  transactionStats,
  isLoading,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {isLoading ? (
        <>
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </>
      ) : (
        <>
          <SummaryCard
            value={
              transactionStats
                ? `${formatAmount(transactionStats.totalVolume)} LPT`
                : null
            }
            label="Total Volume"
            isLoading={isLoading}
          />
          <SummaryCard
            value={
              transactionStats
                ? transactionStats.confirmed.toString()
                : null
            }
            label="Successful"
            isLoading={isLoading}
          />
          <SummaryCard
            value={
              transactionStats ? transactionStats.failed.toString() : null
            }
            label="Failed"
            isLoading={isLoading}
          />
          <SummaryCard
            value={
              transactionStats ? transactionStats.pending.toString() : null
            }
            label="Pending"
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

