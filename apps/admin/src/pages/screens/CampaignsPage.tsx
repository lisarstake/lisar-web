import React, { useState, useEffect } from "react";
import { useCampaign } from "@/contexts/CampaignContext";
import { CampaignTier, CampaignStatus } from "@/services/campaigns/types";
import { CampaignList } from "../../components/screens/CampaignList";
import {
  SummaryCard,
  SummaryCardSkeleton,
} from "@/components/screens/SummaryCard";

export const CampaignsPage: React.FC = () => {
  const {
    campaignOverview,
    paginatedUsers,
    isLoading,
    isLoadingOverview,
    getCampaignOverview,
    searchCampaignUsers,
  } = useCampaign();

  const [selectedTier, setSelectedTier] = useState<CampaignTier>(1);
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | "all">(
    "all"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 50;

  // Load overview on mount
  useEffect(() => {
    if (!campaignOverview && !isLoadingOverview) {
      getCampaignOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load users based on filters
  useEffect(() => {
    const filters: any = {
      tier: selectedTier,
      page: currentPage,
      limit: pageLimit,
    };

    if (selectedStatus !== "all") {
      filters.status = selectedStatus;
    }

    searchCampaignUsers(filters);
  }, [selectedTier, selectedStatus, currentPage, searchCampaignUsers]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {isLoadingOverview ? (
          <>
            <SummaryCardSkeleton color="green" />
            <SummaryCardSkeleton color="blue" />
            <SummaryCardSkeleton color="orange" />
          </>
        ) : (
          <>
            {/* Card 1: Enrollments */}
            <SummaryCard
              title="Campaign Enrollments"
              subtitle={`${campaignOverview?.active_enrollments || 0} Active Users`}
              value={(
                campaignOverview?.total_enrollments || 0
              ).toLocaleString()}
              color="green"
              isLoading={isLoadingOverview}
            />

            {/* Card 2: Tier Breakdown */}
            <SummaryCard
              title="Tier Distribution"
              subtitle="Users per tier"
              value={`${(campaignOverview?.users_by_tier.tier_1 || 0).toLocaleString()} -  ${(campaignOverview?.users_by_tier.tier_2 || 0).toLocaleString()} - ${(campaignOverview?.users_by_tier.tier_3 || 0).toLocaleString()}`}
              color="blue"
              isLoading={isLoadingOverview}
            />

            {/* Card 3: Total Bonus Paid */}
            <SummaryCard
              title="Campaign rewards"
              subtitle=" Total Bonuses Paid"
              value={`₦${(campaignOverview?.total_bonuses_paid_ngn || 0).toLocaleString()}`}
              color="orange"
              isLoading={isLoadingOverview}
            />
          </>
        )}
      </div>

      {/* Users Table */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
            {selectedTier === 1
              ? "Early Savers"
              : selectedTier === 2
                ? "Consistent Savers"
                : "Champion Savers"}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTier}
              onChange={(e) => {
                setSelectedTier(Number(e.target.value) as CampaignTier);
                setCurrentPage(1);
              }}
              className="text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent min-w-[100px]"
            >
              <option value={1}>Tier 1</option>
              <option value={2}>Tier 2</option>
              <option value={3}>Tier 3</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as CampaignStatus | "all");
                setCurrentPage(1);
              }}
              className="text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent min-w-[100px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="champion">Champion</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>
        <CampaignList
          users={paginatedUsers}
          isLoading={isLoading}
          error={null}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
