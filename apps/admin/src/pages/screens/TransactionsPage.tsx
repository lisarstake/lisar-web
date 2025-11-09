import React, { useState, useEffect } from "react";
import { useTransaction } from "@/contexts/TransactionContext";
import { TransactionFilters } from "@/services/transactions/types";
import { TransactionSummaryCards } from "../../components/screens/TransactionSummaryCards";
import { TransactionList } from "../../components/screens/TransactionList";

export const TransactionsPage: React.FC = () => {
  const { state, getFilteredTransactions, refreshTransactionStats } = useTransaction();
  const { transactionStats, isLoadingStats, filteredTransactions, isLoadingFilteredTransactions, error } = state;

  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 20,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Fetch transaction stats on mount
  useEffect(() => {
    if (!transactionStats && !isLoadingStats) {
      refreshTransactionStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    getFilteredTransactions(filters);
  }, [filters, getFilteredTransactions]);

  const handleFilterChange = (key: keyof TransactionFilters, value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, 
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <TransactionSummaryCards
        transactionStats={transactionStats}
        isLoading={isLoadingStats}
      />

      <TransactionList
        transactions={filteredTransactions}
        filters={filters}
        isLoading={isLoadingFilteredTransactions}
        error={error}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

