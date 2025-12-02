import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { BlogCard } from "./BlogCard";
import { mockBlogPosts, mockBlogCategories, searchPosts } from "@/mock/blog";
import Navbar from "@/components/general/nav-bar";
import Footer from "@/components/general/footer";
import { format } from "date-fns";

export const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Get the latest post (most recent published date)
  const latestPost = useMemo(() => {
    return [...mockBlogPosts].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )[0];
  }, []);

  // Get posts by category
  const postsByCategory = useMemo(() => {
    const categories = ["Getting Started", "Announcements", "Community"];
    const result: Record<string, typeof mockBlogPosts> = {};

    categories.forEach((cat) => {
      result[cat] = mockBlogPosts
        .filter((post) => post.category === cat)
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        )
        .slice(0, 3);
    });

    return result;
  }, []);

  const filteredPosts = useMemo(() => {
    let posts = mockBlogPosts;

    // Filter by search query
    if (searchQuery.trim()) {
      posts = searchPosts(searchQuery);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      posts = posts.filter((post) => post.category === selectedCategory);
    }

    // Exclude the latest post from regular list when showing it as featured
    if (!searchQuery && selectedCategory === "all" && latestPost) {
      posts = posts.filter((post) => post.id !== latestPost.id);
    }

    return posts;
  }, [searchQuery, selectedCategory, latestPost]);

  const handleViewAll = (category: string) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen ">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#F8FFF0] py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6">
              Read Stories
              <br />
              from <span className="text-[#235538]">The Clan</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-10 px-4 max-w-2xl mx-auto">
              Insights, guides, and updates from the world of staking and DeFi
            </p>

            {/* Category Filter Buttons */}
            <div className="w-full">
              <div className="flex items-center gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 md:pb-0 md:justify-center md:flex-wrap">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === "all"
                      ? "bg-[#235538] text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  All
                </button>
                {mockBlogCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategory === category.name
                        ? "bg-[#235538] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles Section with Featured Post */}
      {!searchQuery && selectedCategory === "all" && latestPost && (
        <section className="py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 md:mb-8">
              Latest Article
            </h2>

            <div
              onClick={() => navigate(`/blog/${latestPost.slug}`)}
              className="group cursor-pointer bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 mb-8 md:mb-12"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Left Content */}
                <div className="flex-1 p-6 md:p-8 lg:p-12 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-[#235538] text-white text-xs font-semibold rounded-full">
                        {latestPost.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(
                          new Date(latestPost.publishedAt),
                          "MMMM dd, yyyy"
                        )}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-[#235538] transition-colors leading-tight">
                      {latestPost.title}
                    </h3>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6 line-clamp-3">
                      {latestPost.excerpt}
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-2 text-[#235538] font-semibold text-sm sm:text-base group-hover:gap-3 transition-all w-fit">
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Right Image */}
                <div className="w-full lg:w-1/2 h-64 lg:h-auto lg:min-h-[400px] overflow-hidden">
                  <img
                    src={latestPost.coverImage}
                    alt={latestPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Sections */}
      {!searchQuery && selectedCategory === "all" && (
        <>
          {["Getting Started", "Announcements", "Community"].map((category) => {
            const posts = postsByCategory[category];
            if (!posts || posts.length === 0) return null;

            return (
              <section
                key={category}
                className="py-4 md:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-white"
              >
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {category}
                    </h2>
                    <button
                      onClick={() => handleViewAll(category)}
                      className="inline-flex items-center gap-2 text-[#235538] border border-gray-200 rounded-full px-4 py-2 font-medium text-sm sm:text-base hover:gap-3 transition-all"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {posts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </>
      )}

      {/* Filtered Posts (when category or search is active) */}
      {(searchQuery || selectedCategory !== "all") && (
        <section className="py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            {searchQuery && (
              <div className="mb-6 md:mb-8">
                <div className="relative max-w-2xl mx-auto mb-6">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C7EF6B] focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">
                  Search Results for "{searchQuery}"
                </h2>
              </div>
            )}

            {selectedCategory !== "all" && (
              <div className="mb-6 md:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {selectedCategory}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  {filteredPosts.length}{" "}
                  {filteredPosts.length === 1 ? "article" : "articles"} found
                </p>
              </div>
            )}

            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 md:py-16">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 px-4">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="px-6 py-3 bg-[#235538] text-white rounded-lg font-medium hover:bg-[#1a4029] transition-colors text-sm sm:text-base"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#F8FFF0]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Stay Updated
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 md:mb-8 px-4">
            Get the latest articles and insights delivered straight to your
            inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto px-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C7EF6B] focus:border-transparent text-sm sm:text-base"
            />
            <button className="px-6 sm:px-8 py-3 bg-[#235538] text-white rounded-lg font-medium hover:bg-[#1a4029] transition-colors text-sm sm:text-base whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
