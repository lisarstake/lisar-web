import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTransaction } from "@/contexts/TransactionContext";
import {
  formatDate,
  formatAmount,
  getStatusColor,
  getStatusIcon,
  formatTransactionType,
  formatWalletAddress,
} from "@/lib/formatters";

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

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useTransaction();
  const {
    dashboardSummary,
    transactions,
    isLoadingSummary,
    isLoadingTransactions,
    error,
  } = state;

  const handleTransactionClick = () => {
    navigate(`/transactions`)
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {isLoadingSummary ? (
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
                dashboardSummary
                  ? dashboardSummary.totalDelegators.toString()
                  : null
              }
              label="Total Delegators"
              isLoading={isLoadingSummary}
            />
            <SummaryCard
              value={
                dashboardSummary
                  ? `₦ ${formatAmount(dashboardSummary.totalNgNConverted)}`
                  : null
              }
              label="Total Converted"
              isLoading={isLoadingSummary}
            />
            <SummaryCard
              value={
                dashboardSummary
                  ? `${formatAmount(dashboardSummary.totalLptDelegated)} LPT`
                  : null
              }
              label="Total Delegated"
              isLoading={isLoadingSummary}
            />
            <SummaryCard
              value={
                dashboardSummary
                  ? dashboardSummary.totalValidators.toString()
                  : null
              }
              label="Total Validators"
              isLoading={isLoadingSummary}
            />
          </>
        )}
      </div>

      {/* Transactions Table */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Recent Transactions
        </h2>
        <Card className="bg-white overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider table-cell">
                        Account
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Description
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Transaction
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoadingTransactions ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <Skeleton className="h-4 w-32" />
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <Skeleton className="h-4 w-24" />
                          </td>
                        </tr>
                      ))
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 sm:px-6 py-8 text-center text-sm text-gray-500"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 sm:px-6 py-8 text-center text-sm text-gray-500"
                        >
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction, idx) => (
                        <tr
                          key={transaction.transaction_hash || idx}
                          onClick={() =>
                            handleTransactionClick()
                          }
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 table-cell">
                            {formatWalletAddress(transaction.address)}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900 hidden sm:block">
                                {formatTransactionType(transaction.event)}
                              </span>
                              <span className="text-xs text-gray-500 sm:hidden">
                                {transaction.event || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 hidden sm:table-cell">
                            {transaction.description || "N/A"}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                            {formatWalletAddress(transaction.transaction_hash)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
