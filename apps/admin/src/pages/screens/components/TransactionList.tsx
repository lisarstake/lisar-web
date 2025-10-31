import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  TransactionFilters,
  PaginatedTransactionsResponse,
  Transaction,
} from "@/services/transactions/types";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatAmount = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getStatusColor = (status: string): string => {
  const normalized = status.toLowerCase();
  if (normalized === "confirmed") {
    return "bg-green-100 text-green-800 border-0 text-xs";
  } else if (normalized === "pending") {
    return "bg-yellow-100 text-yellow-800 border-0 text-xs";
  } else {
    return "bg-red-100 text-red-800 border-0 text-xs";
  }
};

const getStatusIcon = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "confirmed") {
    return <CheckCircle2 className="w-3 h-3 mr-1" />;
  }
  return <XCircle className="w-3 h-3 mr-1" />;
};

interface TransactionListProps {
  transactions: PaginatedTransactionsResponse | null;
  filters: TransactionFilters;
  isLoading: boolean;
  error: string | null;
  onFilterChange: (
    key: keyof TransactionFilters,
    value: string | number | undefined
  ) => void;
  onPageChange: (page: number) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  filters,
  isLoading,
  error,
  onFilterChange,
  onPageChange,
}) => {
  const transactionList = transactions?.transactions || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Transactions
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.status || ""}
            onChange={(e) =>
              onFilterChange("status", e.target.value || undefined)
            }
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filters.type || ""}
            onChange={(e) =>
              onFilterChange("type", e.target.value || undefined)
            }
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="delegation">Delegation</option>
            <option value="undelegation">Undelegation</option>
          </select>
          <select
            value={filters.sortBy || "created_at"}
            onChange={(e) => onFilterChange("sortBy", e.target.value)}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent"
          >
            <option value="created_at">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="status">Sort by Status</option>
            <option value="transaction_type">Sort by Type</option>
          </select>
          <select
            value={filters.sortOrder || "desc"}
            onChange={(e) =>
              onFilterChange("sortOrder", e.target.value as "asc" | "desc")
            }
            className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>
      <Card className="bg-white overflow-hidden py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Tx ID
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Type
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <Skeleton className="h-4 w-24" />
                        </td>
                      </tr>
                    ))
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 sm:px-6 py-8 text-center text-sm text-gray-500"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : transactionList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 sm:px-6 py-8 text-center text-sm text-gray-500"
                      >
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactionList.map((transaction, idx) => {
                      const walletAddress =
                        transaction.users?.wallet_address ||
                        transaction.wallet_address;
                      const initials = walletAddress
                        ? walletAddress.slice(2, 4).toUpperCase()
                        : "U";

                      return (
                        <tr
                          key={transaction.tid || idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-gray-700 hidden md:table-cell">
                            {transaction.tid.slice(0, 6)}...
                            {transaction.tid.slice(-4)}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                                <AvatarFallback>{initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-900 block">
                                  {walletAddress.slice(0, 6)}...
                                  {walletAddress.slice(-4)}
                                </span>
                                <span className="text-xs text-gray-500 md:hidden">
                                  {transaction.transaction_hash.slice(0, 6)}...
                                  {transaction.transaction_hash.slice(-4)}
                                </span>
                                <span className="text-xs text-gray-500 lg:hidden">
                                  {transaction.transaction_type
                                    .charAt(0)
                                    .toUpperCase() +
                                    transaction.transaction_type.slice(1)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden lg:table-cell">
                            {transaction.transaction_type
                              .charAt(0)
                              .toUpperCase() +
                              transaction.transaction_type.slice(1)}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium">
                            {formatAmount(transaction.amount)}{" "}
                            {transaction.token_symbol}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={getStatusColor(transaction.status)}
                            >
                              {getStatusIcon(transaction.status)}
                              <span className="hidden sm:inline">
                                {transaction.status.charAt(0).toUpperCase() +
                                  transaction.status.slice(1)}
                              </span>
                              <span className="sm:hidden">
                                {transaction.status.charAt(0).toUpperCase()}
                              </span>
                            </Badge>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                            {formatDate(transaction.created_at)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {transactions && transactions.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((filters.page || 1) - 1)}
              disabled={!filters.page || filters.page <= 1}
              className="text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((filters.page || 1) + 1)}
              disabled={
                !transactions || (filters.page || 1) >= transactions.totalPages
              }
              className="text-xs"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(filters.page || 1) * (filters.limit || 20) -
                    (filters.limit || 20) +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    (filters.page || 1) * (filters.limit || 20),
                    transactions.total
                  )}
                </span>{" "}
                of <span className="font-medium">{transactions.total}</span>{" "}
                results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange((filters.page || 1) - 1)}
                disabled={!filters.page || filters.page <= 1}
                className="text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-xs sm:text-sm text-gray-700">
                Page {filters.page || 1} of {transactions.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange((filters.page || 1) + 1)}
                disabled={
                  !transactions ||
                  (filters.page || 1) >= transactions.totalPages
                }
                className="text-xs"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
