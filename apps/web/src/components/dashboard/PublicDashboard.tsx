import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import {
  arbiscanService,
  STABLECOIN_VAULT_ADDRESS,
  StablecoinMetrics,
} from "@/services/dashboard/arbiscanService";
import { DashboardTransaction } from "@/services/dashboard/types";
import { ArrowUpRight } from "lucide-react";
import { shortenHash } from "@/lib/utils";

const TRANSACTIONS_PER_PAGE = 8;

export const PublicDashboard: React.FC = () => {
  const { summary, transactions: lptTransactions, isLoading: isLptLoading, error: lptError, refetch: refetchLpt } = useDashboard();
  const [activeTab, setActiveTab] = useState<"lpt" | "stablecoin">("lpt");
  const [stablecoinTransactions, setStablecoinTransactions] = useState<DashboardTransaction[]>([]);
  const [stablecoinMetrics, setStablecoinMetrics] = useState<StablecoinMetrics | null>(null);
  const [isStablecoinLoading, setIsStablecoinLoading] = useState(false);
  const [isStablecoinMetricsLoading, setIsStablecoinMetricsLoading] = useState(false);
  const [stablecoinError, setStablecoinError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<SortType>("date");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch stablecoin transactions and on-chain metrics from Arbitrum/Arbiscan
  const fetchStablecoinData = useCallback(async () => {
    try {
      setIsStablecoinLoading(true);
      setIsStablecoinMetricsLoading(true);
      setStablecoinError(null);
      
      const data = await arbiscanService.getStablecoinTransactions(STABLECOIN_VAULT_ADDRESS, 50);
      setStablecoinTransactions(data);

      const metrics = await arbiscanService.getStablecoinMetrics(STABLECOIN_VAULT_ADDRESS, data);
      setStablecoinMetrics(metrics);
    } catch (err: any) {
      setStablecoinError(err?.message || "Failed to load stablecoin transactions");
    } finally {
      setIsStablecoinLoading(false);
      setIsStablecoinMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStablecoinData();
  }, [fetchStablecoinData]);

  const activeTransactions = activeTab === "lpt" ? lptTransactions : stablecoinTransactions;
  const isLoading = activeTab === "lpt" ? isLptLoading : isStablecoinLoading;
  const error = activeTab === "lpt" ? lptError : stablecoinError;
  const refetch = activeTab === "lpt" ? refetchLpt : fetchStablecoinData;

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    if (!activeTransactions.length) return [];

    const sorted = [...activeTransactions].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "account":
          return (a.address || "").localeCompare(b.address || "");
        case "event":
          return (a.event || "").localeCompare(b.event || "");
        default:
          return 0;
      }
    });

    return sorted;
  }, [activeTransactions, sortBy]);

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

  const handleTabChange = (tab: "lpt" | "stablecoin") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Overview Section */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-white">
                Overview
              </h1>
              <p className="text-gray-400 text-sm md:text-base mt-1 max-w-2xl">
                {activeTab === "lpt"
                  ? "Real-time statistics and insights into Lisar. Track total delegators, staked amounts, and validator activity."
                  : "Real-time statistics and on-chain analytics for Lisar Stablecoins on Arbitrum One."}
              </p>
            </div>

            {/* Overview Tab Switcher */}
            <div className="flex items-center bg-[#141414] border border-[#333333] p-1 rounded-xl self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => handleTabChange("lpt")}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  activeTab === "lpt"
                    ? "bg-[#C7EF6B] text-black shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                LPT Transactions
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("stablecoin")}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  activeTab === "stablecoin"
                    ? "bg-[#C7EF6B] text-black shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Stablecoin Transactions
              </button>
            </div>
          </div>

          <MetricsCards
            activeTab={activeTab}
            summary={summary}
            isLoading={activeTab === "lpt" ? isLptLoading : isStablecoinMetricsLoading}
            error={activeTab === "lpt" ? lptError : stablecoinError}
            stablecoinMetrics={stablecoinMetrics}
          />
        </section>

        {/* Transactions Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-white">
              Transactions
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === "lpt"
                ? "Live LPT staking, bonding & reward transactions"
                : "Recent stablecoin deposits & transfers on Arbitrum"}
            </p>
          </div>

          {activeTab === "stablecoin" && (
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-gray-400 bg-[#121212] border border-[#2b2b2b] px-4 py-2.5 rounded-lg">
              <span>Arbiscan Tracked Address:</span>
              <a
                href={`https://arbiscan.io/address/${STABLECOIN_VAULT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#C7EF6B] hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>{STABLECOIN_VAULT_ADDRESS}</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          )}

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
