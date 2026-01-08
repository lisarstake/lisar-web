import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  PaginatedCampaignUsersResponse,
  CampaignFilters,
} from "@/services/campaigns/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatDate, formatAmount, getInitials } from "@/lib/formatters";

interface CampaignListProps {
  users: PaginatedCampaignUsersResponse | null;
  filters: CampaignFilters;
  isLoading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
}

const getTierLabel = (tier: string) => {
  switch (tier) {
    case "tier_1":
      return "Early Saver";
    case "tier_2":
      return "Consistent Saver";
    case "tier_3":
      return "Champion Saver";
    default:
      return tier;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "in_progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "failed":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

const formatStatusLabel = (status: string) => {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return status;
  }
};

export const CampaignList: React.FC<CampaignListProps> = ({
  users,
  filters,
  isLoading,
  error,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const userList = users?.users || [];

  const handleUserClick = (userId: string) => {
    navigate(`/campaigns/${userId}`);
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
                      User
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Joined Campaign
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:table-cell">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    Array.from({ length: filters.limit || 50 }).map(
                      (_, index) => (
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
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-4 w-16" />
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </td>
                        </tr>
                      )
                    )
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 sm:px-6 py-8 text-center text-sm text-red-500"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : userList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 sm:px-6 py-8 text-center text-sm text-gray-500"
                      >
                        No campaign users found
                      </td>
                    </tr>
                  ) : (
                    userList.map((user) => (
                      <tr
                        key={user.user_id}
                        onClick={() => handleUserClick(user.user_id)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                              <AvatarImage src={user.img || undefined} />
                              <AvatarFallback>
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900 block">
                                {user.full_name || "N/A"}
                              </span>
                              <span className="text-xs text-gray-500 hidden">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                          {user.email}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden lg:table-cell">
                          {formatDate(user.joined_campaign)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 font-medium">
                          {formatAmount(user.wallet_balance)} USDC
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm sm:table-cell">
                          <Badge className={getStatusColor(user.status)}>
                            {formatStatusLabel(user.status)}
                          </Badge>
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

      {/* Pagination */}
      {users && users.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onPageChange((filters.page || 1) - 1)}
              disabled={!filters.page || filters.page <= 1}
              className="text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onPageChange((filters.page || 1) + 1)}
              disabled={!users || (filters.page || 1) >= users.totalPages}
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
                  {(filters.page || 1) * (filters.limit || 50) -
                    (filters.limit || 50) +
                    1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    (filters.page || 1) * (filters.limit || 50),
                    users.total
                  )}
                </span>{" "}
                of <span className="font-medium">{users.total}</span> results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => onPageChange((filters.page || 1) - 1)}
                disabled={!filters.page || filters.page <= 1}
                className="text-xs"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-xs sm:text-sm text-gray-700">
                Page {filters.page || 1} of {users.totalPages}
              </span>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onPageChange((filters.page || 1) + 1)}
                disabled={!users || (filters.page || 1) >= users.totalPages}
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
