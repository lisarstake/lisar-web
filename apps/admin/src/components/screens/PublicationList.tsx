import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BlogPost } from "@/types/blog";
import { PaginatedPublicationsResponse } from "@/services/publications/types";
import { format } from "date-fns";
import { Eye, Edit, Trash2, Star, FileText, EyeClosed, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmDrawer } from "@/components/ui/ConfirmDrawer";
import { Button } from "../ui/button";

interface PublicationListProps {
  publications: PaginatedPublicationsResponse | null;
  isLoading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
}

export const PublicationList: React.FC<PublicationListProps> = ({
  publications,
  isLoading,
  error,
  onPageChange,
  onDelete,
  onToggleStatus,
}) => {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    publicationId: string | null;
    publicationTitle: string;
  }>({
    isOpen: false,
    publicationId: null,
    publicationTitle: "",
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!publications || !publications.posts || publications.posts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No publications found
        </h3>
        <p className="text-gray-600 mb-6">
          Get started by creating your first blog post
        </p>
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-700">Published</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-700">Draft</Badge>;
      case "archived":
        return <Badge className="bg-gray-100 text-gray-700">Archived</Badge>;
      default:
        return null;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case "published":
        return "Published";
      case "draft":
        return "Draft";
      case "archived":
        return "Archived";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Published
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {publications.posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="max-w-xs">
                        <span className="text-xs sm:text-sm font-medium text-gray-900 truncate flex items-center">
                          {post.title} {post.featured && (
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 inline-block ml-1.5 mb-0.3" />
                        )}
                        </span>
                        
                        <span className="text-xs text-gray-500 md:hidden block truncate">
                          {post.category} • {getStatusText(post.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <Badge variant="outline">{post.category}</Badge>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden lg:table-cell">
                      {format(new Date(post.published_at), "MMM dd, yyyy")}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() =>
                            onToggleStatus(post.id, post.status || "archived")
                          }
                          className={`p-1.5 sm:p-2 rounded-lg transition-colors`}
                          title={
                            post.status === "published" ? "Archive" : "Publish"
                          }
                        >
                          {post.status === "published" ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/publications/${post.id}/edit`)
                          }
                          className="p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteConfirm({
                              isOpen: true,
                              publicationId: post.id,
                              publicationTitle: post.title,
                            });
                          }}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {publications.pagination && publications.pagination.total_pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-600 whitespace-nowrap">
            Showing{" "}
            {(publications.pagination.current_page - 1) *
              publications.pagination.items_per_page +
              1}{" "}
            to{" "}
            {Math.min(
              publications.pagination.current_page *
                publications.pagination.items_per_page,
              publications.pagination.total_items
            )}{" "}
            of {publications.pagination.total_items} publications
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() =>
                onPageChange(publications.pagination.current_page - 1)
              }
              disabled={publications.pagination.current_page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Previous
            </button>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {[...Array(publications.pagination.total_pages)].map((_, i) => {
                const page = i + 1;
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === publications.pagination.total_pages ||
                  (page >= publications.pagination.current_page - 1 &&
                    page <= publications.pagination.current_page + 1);

                if (!showPage) {
                  // Show ellipsis
                  if (
                    i === 1 ||
                    i === publications.pagination.total_pages - 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 text-sm border rounded-lg transition-colors whitespace-nowrap ${
                      page === publications.pagination.current_page
                        ? "bg-[#235538] text-white border-[#235538]"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() =>
                onPageChange(publications.pagination.current_page + 1)
              }
              disabled={
                publications.pagination.current_page ===
                publications.pagination.total_pages
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Drawer */}
      <ConfirmDrawer
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            publicationId: null,
            publicationTitle: "",
          })
        }
        onConfirm={() => {
          if (deleteConfirm.publicationId) {
            onDelete(deleteConfirm.publicationId);
          }
        }}
        title="Delete Publication"
        message={`Are you sure you want to delete "${deleteConfirm.publicationTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
