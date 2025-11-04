import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { UserFilters } from "@/services/users/types";
import { UserList } from "./components/UserList";

const SummaryCard: React.FC<{
  value: string;
  label: string;
  sub: string;
  positive?: boolean;
}> = ({ value, label, sub, positive = true }) => (
  <Card className="bg-white">
    <CardContent className="p-6">
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
    </CardContent>
  </Card>
);

export const UsersPage: React.FC = () => {
  const { state, getUserStats, getUsers } = useUser();
  const { userStats, paginatedUsers, isLoading, isLoadingStats } = state;

  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 50,
    status: "all",
    sortOrder: "asc",
  });

  useEffect(() => {
    getUserStats();
  }, [getUserStats]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <SummaryCard
          value={totalUsers.toLocaleString()}
          label="Total Users"
          sub={`${activeUsers} active`}
        />
        <SummaryCard
          value={activeUsers.toLocaleString()}
          label="Active Users"
          sub={`${suspendedUsers} suspended`}
        />
        <SummaryCard
          value={suspendedUsers.toLocaleString()}
          label="Suspended Users"
          sub={`${totalUsers - suspendedUsers} active`}
          positive={false}
        />
        <SummaryCard
          value={newUsersToday.toString()}
          label="New Users Today"
          sub={`${totalLptBalance.toFixed(2)} LPT total`}
        />
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
