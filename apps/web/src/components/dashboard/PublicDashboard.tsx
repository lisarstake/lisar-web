import React, { useState, useMemo } from "react";
import { useDashboard } from "@/contexts/DashboardContext";
import { SortType } from "@/types/dashboard";
import { DashboardHeader } from "./DashboardHeader";
import { MetricsCards } from "./MetricsCards";
import {
  TransactionsTable,
  TransactionsTableSkeleton,
  TransactionsErrorState,
  TransactionsPagination,
} from "./TransactionsTable";

const TRANSACTIONS_PER_PAGE = 8;

export const PublicDashboard: React.FC = () => {
  const { summary, transactions, isLoading, error, refetch } = useDashboard();
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [currentPage, setCurrentPage] = useState(1);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    if (!transactions.length) return [];

    const sorted = [...transactions].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "account":
          return a.address.localeCompare(b.address);
        case "event":
          return a.event.localeCompare(b.event);
        default:
          return 0;
      }
    });

    return sorted;
  }, [transactions, sortBy]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
    const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
    return sortedTransactions.slice(startIndex, endIndex);
  }, [sortedTransactions, currentPage]);

  const totalPages = Math.ceil(sortedTransactions.length / TRANSACTIONS_PER_PAGE);

  const handleSort = (column: SortType) => {
    setSortBy(column);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Overview Section */}
        <section className="mb-16">
          <h1 className="text-xl md:text-3xl font-bold text-white mb-4">
            Overview
          </h1>
          <p className="text-gray-400 text-base md:text-lg mb-8 max-w-3xl">
            Real-time statistics and insights into Lisar. Track total delegators, staked amounts, and validator
            activity.
          </p>

          <MetricsCards
            summary={summary}
            isLoading={isLoading}
            error={error}
          />
        </section>

        {/* Transactions Section */}
        <section>
          <h2 className="text-xl md:text-3xl font-bold text-white mb-8">
            Transactions
          </h2>

          {isLoading ? (
            <TransactionsTableSkeleton />
          ) : error ? (
            <TransactionsErrorState onRetry={refetch} />
          ) : (
            <>
              <TransactionsTable
                transactions={paginatedTransactions}
                sortBy={sortBy}
                onSort={handleSort}
              />

              {/* Pagination */}
              {sortedTransactions.length > TRANSACTIONS_PER_PAGE && (
                <TransactionsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};
