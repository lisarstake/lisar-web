import React from "react";
import { TransactionStats } from "@/services/transactions/types";
import { formatAmount } from "@/lib/formatters";
import {
  SummaryCard,
  SummaryCardSkeleton,
} from "./SummaryCard";

interface TransactionSummaryCardsProps {
  transactionStats: TransactionStats | null;
  isLoading: boolean;
}

export const TransactionSummaryCards: React.FC<TransactionSummaryCardsProps> = ({
  transactionStats,
  isLoading,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            title="Total Volume"
            subtitle="All transactions"
            value={
              transactionStats
                ? `${formatAmount(transactionStats.totalVolume)} LPT`
                : null
            }
            color="green"
            isLoading={isLoading}
          />
          <SummaryCard
            title="Successful"
            subtitle={`${transactionStats?.confirmed || 0} confirmed`}
            value={
              transactionStats
                ? transactionStats.confirmed.toString()
                : null
            }
            color="blue"
            isLoading={isLoading}
          />
          <SummaryCard
            title="Failed"
            subtitle={`${transactionStats?.failed || 0} failed`}
            value={
              transactionStats ? transactionStats.failed.toString() : null
            }
            color="lime"
            isLoading={isLoading}
          />
          <SummaryCard
            title="Pending"
            subtitle={`${transactionStats?.pending || 0} pending`}
            value={
              transactionStats ? transactionStats.pending.toString() : null
            }
            color="orange"
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

