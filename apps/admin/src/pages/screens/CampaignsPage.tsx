import React, { useState, useEffect } from "react";
import { useCampaign } from "@/contexts/CampaignContext";
import { CampaignFilters, CampaignTier } from "@/services/campaigns/types";
import { CampaignList } from "../../components/screens/CampaignList";
import {
  SummaryCard,
  SummaryCardSkeleton,
} from "@/components/screens/SummaryCard";

export const CampaignsPage: React.FC = () => {
  const {
    campaignStats,
    paginatedUsers,
    isLoading,
    isLoadingStats,
    getCampaignStats,
    getCampaignUsers,
  } = useCampaign();

  const [selectedTier, setSelectedTier] = useState<CampaignTier>("tier_1");
  const [filters, setFilters] = useState<CampaignFilters>({
    page: 1,
    limit: 50,
    tier: "tier_1",
    status: "all",
    sortOrder: "desc",
  });

  useEffect(() => {
    if (!campaignStats && !isLoadingStats) {
      getCampaignStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getCampaignUsers(filters);
  }, [filters, getCampaignUsers]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleTierSelect = (tier: CampaignTier) => {
    setSelectedTier(tier);
    setFilters((prev) => ({ ...prev, tier, page: 1 }));
  };

  const tier1Count = campaignStats?.tier1Count || 0;
  const tier2Count = campaignStats?.tier2Count || 0;
  const tier3Count = campaignStats?.tier3Count || 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Tier Cards - Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {isLoadingStats ? (
          <>
            <SummaryCardSkeleton color="green" />
            <SummaryCardSkeleton color="blue" />
            <SummaryCardSkeleton color="orange" />
          </>
        ) : (
          <>
            <div
              onClick={() => handleTierSelect("tier_1")}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <SummaryCard
                title="Early Savers"
                subtitle="Active participants"
                value={tier1Count.toLocaleString()}
                color="green"
                isLoading={isLoadingStats}
              />
            </div>
            <div
              onClick={() => handleTierSelect("tier_2")}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <SummaryCard
                title="Consistent Savers"
                subtitle="Active participants"
                value={tier2Count.toLocaleString()}
                color="blue"
                isLoading={isLoadingStats}
              />
            </div>
            <div
              onClick={() => handleTierSelect("tier_3")}
              className="cursor-pointer transition-transform hover:scale-105"
            >
              <SummaryCard
                title="Champion Savers"
                subtitle="Active participants"
                value={tier3Count.toLocaleString()}
                color="orange"
                isLoading={isLoadingStats}
              />
            </div>
          </>
        )}
      </div>

      {/* Users Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            {selectedTier === "tier_1"
              ? "Early Savers"
              : selectedTier === "tier_2"
                ? "Consistent Savers"
                : "Champion Savers"}{" "}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filters.status || "all"}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value as
                    | "all"
                    | "in_progress"
                    | "completed"
                    | "failed",
                  page: 1,
                }))
              }
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filters.sortBy || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as
                    | "wallet_balance"
                    | "joined_campaign"
                    | "full_name"
                    | undefined,
                  page: 1,
                }))
              }
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent"
            >
              <option value="">Sort By</option>
              <option value="wallet_balance">Wallet Balance</option>
              <option value="joined_campaign">Joined Date</option>
              <option value="full_name">Name</option>
            </select>
            <select
              value={filters.sortOrder || "desc"}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortOrder: e.target.value as "asc" | "desc",
                  page: 1,
                }))
              }
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        <CampaignList
          users={paginatedUsers}
          filters={filters}
          isLoading={isLoading}
          error={null}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
