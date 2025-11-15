import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { UserFilters } from "@/services/users/types";
import { UserList } from "../../components/screens/UserList";
import {
  SummaryCard,
  SummaryCardSkeleton,
} from "@/components/screens/SummaryCard";

export const UsersPage: React.FC = () => {
  const { state, getUserStats, getUsers } = useUser();
  const { userStats, paginatedUsers, isLoading, isLoadingStats } = state;

  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 50,
    status: "all",
    sortOrder: "asc",
  });

  // Fetch user stats on mount if not already present
  useEffect(() => {
    if (!userStats && !isLoadingStats) {
      getUserStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  useEffect(() => {
    getUsers(filters);
  }, [filters, getUsers]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const totalUsers = userStats?.totalUsers || 0;
  const activeUsers = userStats?.activeUsers || 0;
  const suspendedUsers = userStats?.suspendedUsers || 0;
  const newUsersToday = userStats?.newUsersToday || 0;
  const totalLptBalance = userStats?.totalLptBalance || 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoadingStats ? (
          <>
            <SummaryCardSkeleton color="green" />
            <SummaryCardSkeleton color="blue" />
            <SummaryCardSkeleton color="lime" />
            <SummaryCardSkeleton color="orange" />
          </>
        ) : (
          <>
            <SummaryCard
              title="Total Users"
              subtitle={`${activeUsers} active users`}
              value={totalUsers.toLocaleString()}
              color="green"
              isLoading={isLoadingStats}
            />
            <SummaryCard
              title="Suspended Users"
              subtitle={`${suspendedUsers} suspended`}
              value={suspendedUsers.toLocaleString()}
              color="blue"
              isLoading={isLoadingStats}
            />
            <SummaryCard
              title="New Users"
              subtitle={`${newUsersToday} users today`}
              value={newUsersToday.toString()}
              color="lime"
              isLoading={isLoadingStats}
            />
            <SummaryCard
              title="Total Balance"
              subtitle="Across all users"
              value={totalLptBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              color="orange"
              isLoading={isLoadingStats}
            />
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Users</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.status || "all"}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as "all" | "active" | "suspended",
                  page: 1,
                }))
              }
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={filters.sortBy || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as
                    | "lpt_balance"
                    | "created_at"
                    | "user_id"
                    | undefined,
                  page: 1,
                }))
              }
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent"
            >
              <option value="">Sort By</option>
              <option value="lpt_balance">LPT Balance</option>
              <option value="created_at">Created Date</option>
              <option value="user_id">User ID</option>
            </select>
            <select
              value={filters.sortOrder || "asc"}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortOrder: e.target.value as "asc" | "desc",
                  page: 1,
                }))
              }
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        <UserList
          users={paginatedUsers}
          filters={filters}
          isLoading={isLoading}
          error={state.error}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
