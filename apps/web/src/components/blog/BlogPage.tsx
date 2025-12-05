import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { BlogCard } from "./BlogCard";
import { blogService } from "@/services/blog";
import Navbar from "@/components/general/nav-bar";
import Footer from "@/components/general/footer";
import { format } from "date-fns";
import { BlogPost, BlogCategory } from "@/types/blog";
import { usePageTracking } from "@/hooks/usePageTracking";
import { trackSearch } from "@/lib/mixpanel";

export const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track blog page visit
  usePageTracking('Blog Page', { page_type: 'blog_list' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [postsResponse, categoriesResponse] = await Promise.all([
          blogService.getBlogPosts(),
          blogService.getCategories(),
        ]);

        if (postsResponse.success && postsResponse.data) {
          
          const posts = Array.isArray(postsResponse.data)
            ? postsResponse.data
            : postsResponse.data.posts || [];
          setAllPosts(Array.isArray(posts) ? posts : []);
        }

        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching blog data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get the latest post (most recent published date)
  const latestPost = useMemo(() => {
    if (!Array.isArray(allPosts) || allPosts.length === 0) return null;
    return [...allPosts].sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )[0];
  }, [allPosts]);

  // Get posts by category
  const postsByCategory = useMemo(() => {
    if (!Array.isArray(allPosts)) return {};
    const categoriesList = ["Getting Started", "Announcements", "Community"];
    const result: Record<string, BlogPost[]> = {};

    categoriesList.forEach((cat) => {
      result[cat] = allPosts
        .filter((post) => post.category === cat)
        .sort(
          (a, b) =>
            new Date(b.published_at).getTime() -
            new Date(a.published_at).getTime()
        )
        .slice(0, 3);
    });

    return result;
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    if (!Array.isArray(allPosts)) return [];
    let posts = allPosts;

    // Filter by search query
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt.toLowerCase().includes(searchLower) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
      
      // Track search
      trackSearch(searchQuery, posts.length);
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
  }, [searchQuery, selectedCategory, latestPost, allPosts]);

  const handleViewAll = (category: string) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#235538]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content - flex-1 to push footer down */}
      <main className="flex-1">
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
              Insights, guides, and latest updates from the Lisar community
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
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-medium transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategory === cat.name
                        ? "bg-[#235538] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      {/* <section className="py-6 md:py-8 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-3.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#235538] focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>
      </section> */}

      {/* Featured Post Section */}
      {!searchQuery && selectedCategory === "all" && latestPost && (
        <section className="py-4 md:py-8 px-4 sm:px-6 lg:px-8 bg-white min-h-[300px]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              Featured Article
            </h2>
            <div
              onClick={() => navigate(`/blog/${latestPost.slug}`)}
              className="bg-white/90 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-56 sm:h-64 md:h-full overflow-hidden">
                  <img
                    src={latestPost.cover_image}
                    alt={latestPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <span className="px-3 py-1 bg-[#C7EF6B] text-[#060E0A] text-xs font-semibold rounded-full">
                      Latest
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {format(new Date(latestPost.published_at), "MMM dd, yyyy")}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-[#235538] transition-colors">
                    {latestPost.title}
                  </h3>

                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 line-clamp-3">
                    {latestPost.excerpt}
                  </p>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <span>{latestPost.category}</span>
                    <span>•</span>
                    <span>{latestPost.reading_time} min read</span>
                  </div>
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
                className="py-4 md:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-white min-h-[300px]"
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
        <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-white min-h-[400px]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : selectedCategory}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <p className="text-base sm:text-lg text-gray-600">
                  No articles found. Try a different search term or category.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty state when no posts exist at all */}
      {!searchQuery && selectedCategory === "all" && (!latestPost || allPosts.length === 0) && (
        <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 bg-white min-h-[400px]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12 sm:py-16">
              <p className="text-base sm:text-lg text-gray-600">
                No articles available at the moment. Check back soon!
              </p>
            </div>
          </div>
        </section>
      )}
      </main>

      <Footer />
    </div>
  );
};
