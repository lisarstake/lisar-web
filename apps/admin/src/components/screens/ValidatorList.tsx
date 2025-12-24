import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginatedValidatorsResponse, ValidatorFilters } from "@/services/validators/types";
import { formatAmount } from "@/lib/formatters";

interface ValidatorListProps {
  validators: PaginatedValidatorsResponse | null;
  filters: ValidatorFilters;
  isLoading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
}

export const ValidatorList: React.FC<ValidatorListProps> = ({
  validators,
  filters,
  isLoading,
  error,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const validatorList = validators?.validators || [];

  const handleValidatorClick = (validatorId: string) => {
    navigate(`/validators/${validatorId}`);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white overflow-hidden py-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Address
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Fee %
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      APY
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Total Delegated
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
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <Skeleton className="h-4 w-20" />
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
                  ) : validatorList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-3 sm:px-6 py-8 text-center text-sm text-gray-500"
                      >
                        No validators found
                      </td>
                    </tr>
                  ) : (
                    validatorList.map((validator) => {
                      return (
                        <tr
                          key={validator.id}
                          onClick={() => handleValidatorClick(validator.id)}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900 block">
                                {validator.name}
                              </span>
                              <span className="text-xs text-gray-500 md:hidden">
                                {validator.address.slice(0, 10)}...
                              </span>
                              <span className="text-xs text-gray-500 lg:hidden">
                                {validator.fee_pct}% • {validator.apy}% APY
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-gray-700 hidden md:table-cell">
                            {validator.address}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <Badge
                              className={
                                validator.is_active
                                  ? "bg-green-100 text-green-800 border-0 text-xs"
                                  : "bg-gray-100 text-gray-800 border-0 text-xs"
                              }
                            >
                              {validator.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium hidden lg:table-cell">
                            {validator.fee_pct}%
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium hidden lg:table-cell">
                            {validator.apy}%
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium hidden lg:table-cell">
                            {formatAmount(validator.total_delegated_lisar)} LPT
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
      {validators && validators.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onPageChange((filters.page || 1) - 1)}
              disabled={!filters.page || filters.page <= 1}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange((filters.page || 1) + 1)}
              disabled={
                !validators || (filters.page || 1) >= validators.totalPages
              }
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
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
                    validators.total
                  )}
                </span>{" "}
                of <span className="font-medium">{validators.total}</span>{" "}
                results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange((filters.page || 1) - 1)}
                disabled={!filters.page || filters.page <= 1}
                className="text-xs px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs sm:text-sm text-gray-700">
                Page {filters.page || 1} of {validators.totalPages}
              </span>
              <button
                onClick={() => onPageChange((filters.page || 1) + 1)}
                disabled={
                  !validators ||
                  (filters.page || 1) >= validators.totalPages
                }
                className="text-xs px-3 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

