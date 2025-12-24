/**
 * Transactions Table Component (includes skeleton, error state, and pagination)
 */

import React from "react";
import { ChevronDown, ArrowUpRight, AlertCircle, RefreshCw } from "lucide-react";
import { DashboardTransaction } from "@/services/dashboard/types";
import { SortType } from "@/types/dashboard";
import { formatRelativeDate, shortenHash, getArbitrumScanUrl } from "@/lib/utils";

/**
 * Highlight amounts in description text
 */
const highlightAmounts = (description: string): React.ReactNode => {
  const words = description.split(" ");
  return words.map((word, index, array) => {
    if (/\d/.test(word)) {
      return (
        <span key={index} className="text-[#C7EF6B] font-medium">
          {word}
          {index < array.length - 1 ? " " : ""}
        </span>
      );
    }
    return <span key={index}>{word + (index < array.length - 1 ? " " : "")}</span>;
  });
};

interface TransactionsTableProps {
  transactions: DashboardTransaction[];
  sortBy: SortType;
  onSort: (column: SortType) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  sortBy,
  onSort,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-8 text-center text-gray-400">
        No transactions available
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
      {/* Table Header */}
      <div className="bg-[#2a2a2a] px-6 py-4">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
          <div
            className="col-span-5 md:col-span-3 flex items-center cursor-pointer hover:text-white"
            onClick={() => onSort("account")}
          >
            ACCOUNT
            {sortBy === "account" && <ChevronDown size={16} className="ml-1" />}
          </div>
          <div
            className="col-span-3 md:col-span-2 flex items-center cursor-pointer hover:text-white"
            onClick={() => onSort("event")}
          >
            EVENT
            {sortBy === "event" && <ChevronDown size={16} className="ml-1" />}
          </div>
          <div className="hidden md:block col-span-3">DESCRIPTION</div>
          <div
            className="col-span-4 md:col-span-2 flex items-center cursor-pointer hover:text-white"
            onClick={() => onSort("date")}
          >
            DATE
            {sortBy === "date" && <ChevronDown size={16} className="ml-1" />}
          </div>
          <div className="hidden md:block col-span-2">TRANSACTION</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-[#2a2a2a]">
        {transactions.map((transaction, index) => (
          <div
            key={`${transaction.transaction_hash}-${index}`}
            className="px-6 py-4 hover:bg-[#2a2a2a]/50 transition-colors"
          >
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Account */}
              <div className="col-span-5 md:col-span-3 min-w-0">
                <span className="bg-[#C7EF6B] text-black px-3 py-1 rounded-full text-xs font-medium inline-block truncate max-w-full">
                  {transaction.address.length > 20
                    ? shortenHash(transaction.address)
                    : transaction.address}
                </span>
              </div>

              {/* Event */}
              <div className="col-span-3 md:col-span-2 text-white text-sm truncate">
                {transaction.event}
              </div>

              {/* Description - Hidden on mobile */}
              <div className="hidden md:block col-span-3 text-white text-sm truncate">
                {highlightAmounts(transaction.description)}
              </div>

              {/* Date */}
              <div className="col-span-4 md:col-span-2 text-white text-sm truncate">
                {formatRelativeDate(transaction.date)}
              </div>

              {/* Transaction - Clickable - Hidden on mobile */}
              <div className="hidden md:flex col-span-2 items-center min-w-0">
                <a
                  href={getArbitrumScanUrl(transaction.transaction_hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center group min-w-0"
                >
                  <span className="bg-[#C7EF6B] text-black px-2 py-1 rounded-full text-xs font-medium group-hover:bg-[#B8E55A] transition-colors cursor-pointer truncate max-w-full">
                    {shortenHash(transaction.transaction_hash)}
                  </span>
                  <ArrowUpRight
                    size={20}
                    className="text-[#C7EF6B] group-hover:text-[#B8E55A] transition-colors ml-1 flex-shrink-0"
                  />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Transactions Table Skeleton Component
 */
export const TransactionsTableSkeleton: React.FC = () => {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
      {/* Table Header Skeleton */}
      <div className="bg-[#2a2a2a] px-6 py-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5 md:col-span-3">
            <div className="h-4 bg-[#2a2a2a] rounded animate-pulse w-20"></div>
          </div>
          <div className="col-span-3 md:col-span-2">
            <div className="h-4 bg-[#2a2a2a] rounded animate-pulse w-16"></div>
          </div>
          <div className="hidden md:block col-span-3">
            <div className="h-4 bg-[#2a2a2a] rounded animate-pulse w-24"></div>
          </div>
          <div className="col-span-4 md:col-span-2">
            <div className="h-4 bg-[#2a2a2a] rounded animate-pulse w-16"></div>
          </div>
          <div className="hidden md:block col-span-2">
            <div className="h-4 bg-[#2a2a2a] rounded animate-pulse w-24"></div>
          </div>
        </div>
      </div>

      {/* Table Body Skeleton */}
      <div className="divide-y divide-[#2a2a2a]">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              {/* Account Skeleton */}
              <div className="col-span-5 md:col-span-3">
                <div className="h-6 bg-[#2a2a2a] rounded-full animate-pulse w-24"></div>
              </div>
              {/* Event Skeleton */}
              <div className="col-span-3 md:col-span-2">
                <div className="h-4 bg-[#2a2a2a] rounded animate-pulse w-20"></div>
              </div>
              {/* Description Skeleton */}
              <div className="hidden md:block col-span-3">
                <div className="h-4 bg-[#2a2a2a] rounded animate-pulse w-32"></div>
              </div>
              {/* Date Skeleton */}
              <div className="col-span-4 md:col-span-2">
                <div className="h-4 bg-[#2a2a2a] rounded animate-pulse w-24"></div>
              </div>
              {/* Transaction Skeleton */}
              <div className="hidden md:flex col-span-2 items-center">
                <div className="h-6 bg-[#2a2a2a] rounded-full animate-pulse w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Transactions Error State Component
 */
interface TransactionsErrorStateProps {
  onRetry: () => void;
}

export const TransactionsErrorState: React.FC<TransactionsErrorStateProps> = ({
  onRetry,
}) => {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-12 flex flex-col items-center justify-center">
      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      <h3 className="text-base font-medium text-white mb-2">
        Sorry, we encountered an error
      </h3>
      <p className="text-gray-400 text-sm text-center mb-6 max-w-sm">
        Please refresh to try again
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-[#C7EF6B] text-black rounded-lg font-medium hover:bg-[#B8E55A] transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Transactions Pagination Component
 */
interface TransactionsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const TransactionsPagination: React.FC<TransactionsPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex items-center justify-center mt-8 gap-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1a1a1a]"
      >
        Previous
      </button>
      <span className="text-white text-sm font-medium">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-[#1a1a1a] border border-[#2a2a2a] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1a1a1a]"
      >
        Next
      </button>
    </div>
  );
};
