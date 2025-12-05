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
import { SuccessDrawer } from "@/components/ui/SuccessDrawer";
import { ErrorDrawer } from "@/components/ui/ErrorDrawer";

export const PublicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    getPublications,
    getPublicationStats,
    getCategories,
    deletePublication,
    togglePublicationStatus,
  } = usePublication();
  const {
    paginatedPublications,
    publicationStats,
    categories,
    isLoading,
    isLoadingStats,
    error,
  } = state;

  console.log(paginatedPublications)

  const [filters, setFilters] = useState<BlogFilters>({
    page: 1,
    limit: 50,
    sortOrder: "desc",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [successDrawer, setSuccessDrawer] = useState({
    isOpen: false,
    title: "",
    message: "",
  });
  const [errorDrawer, setErrorDrawer] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

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
      // Error handled by context
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      await togglePublicationStatus(id, currentStatus);
      
      // Show success drawer
      const newStatus = currentStatus === "published" ? "archived" : "published";
      const statusText = newStatus === "published" ? "published" : "archived";
      setSuccessDrawer({
        isOpen: true,
        title: "Status Updated!",
        message: `Publication has been successfully ${statusText}.`,
      });
      
      // Refresh the list and stats
      getPublications(filters);
      getPublicationStats();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrorDrawer({
        isOpen: true,
        title: "Failed to Update Status",
        message: errorMessage,
      });
    }
  };

  const totalPosts = publicationStats?.total_posts || 0;
  const publishedPosts = publicationStats?.published_posts || 0;
  const draftPosts = publicationStats?.draft_posts || 0;
  const featuredPosts = publicationStats?.featured_posts || 0;

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
              subtitle={`Total publications`}
              value={totalPosts.toString()}
              color="green"
              isLoading={isLoadingStats}
            />
            <SummaryCard
              title="Published"
              subtitle={`Published publications`}
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
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {/* Success Drawer */}
      <SuccessDrawer
        isOpen={successDrawer.isOpen}
        onClose={() => setSuccessDrawer({ ...successDrawer, isOpen: false })}
        title={successDrawer.title}
        message={successDrawer.message}
      />

      {/* Error Drawer */}
      <ErrorDrawer
        isOpen={errorDrawer.isOpen}
        onClose={() => setErrorDrawer({ ...errorDrawer, isOpen: false })}
        title={errorDrawer.title}
        message={errorDrawer.message}
      />
    </div>
  );
};

