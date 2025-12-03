import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePublication } from "@/contexts/PublicationContext";
import { BlogFilters } from "@/types/blog";
import { PublicationList } from "@/components/screens/PublicationList";
import {
  SummaryCard,
  SummaryCardSkeleton,
} from "@/components/screens/SummaryCard";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PublicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    getPublications,
    getPublicationStats,
    getCategories,
    deletePublication,
  } = usePublication();
  const {
    paginatedPublications,
    publicationStats,
    categories,
    isLoading,
    isLoadingStats,
    error,
  } = state;

  const [filters, setFilters] = useState<BlogFilters>({
    page: 1,
    limit: 10,
    status: "all",
    category: "all",
    sortBy: "publishedAt",
    sortOrder: "desc",
  });

  const [searchQuery, setSearchQuery] = useState("");

  // Fetch stats and categories on mount
  useEffect(() => {
    if (!publicationStats && !isLoadingStats) {
      getPublicationStats();
    }
    if (categories.length === 0) {
      getCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch publications when filters change
  useEffect(() => {
    getPublications(filters);
  }, [filters, getPublications]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchQuery,
      page: 1,
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePublication(id);
      // Refresh the list
      getPublications(filters);
      getPublicationStats();
    } catch (error) {
      console.error("Failed to delete publication:", error);
    }
  };

  const totalPosts = publicationStats?.totalPosts || 0;
  const publishedPosts = publicationStats?.publishedPosts || 0;
  const draftPosts = publicationStats?.draftPosts || 0;
  const featuredPosts = publicationStats?.featuredPosts || 0;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Stats Cards */}
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
              title="Total Posts"
              subtitle={`${publishedPosts} published`}
              value={totalPosts.toString()}
              color="green"
              isLoading={isLoadingStats}
            />
            <SummaryCard
              title="Published"
              subtitle={`${draftPosts} drafts`}
              value={publishedPosts.toString()}
              color="blue"
              isLoading={isLoadingStats}
            />
            <SummaryCard
              title="Draft Posts"
              subtitle="Work in progress"
              value={draftPosts.toString()}
              color="lime"
              isLoading={isLoadingStats}
            />
            <SummaryCard
              title="Featured"
              subtitle="Highlighted posts"
              value={featuredPosts.toString()}
              color="orange"
              isLoading={isLoadingStats}
            />
          </>
        )}
      </div>

      {/* Filters and Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Publications
          </h2>
          <Button
            onClick={() => navigate("/publications/create")}
            size="lg"
            className=""
          >
            <Plus className="w-4 h-4" />
            New Publication
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search publications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        
        </div>

        {/* Publications List */}
        <PublicationList
          publications={paginatedPublications}
          isLoading={isLoading}
          error={error}
          onPageChange={handlePageChange}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

