import { useNavigate } from "react-router-dom";
import { LisarLines } from "./lisar-lines";
import { getFeaturedPosts } from "@/mock/blog";
import { Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NewsSection = () => {
  const navigate = useNavigate();
  const featuredPosts = getFeaturedPosts().slice(0, 3); // Get top 3 featured posts

  const handleArticleClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const handleViewAll = () => {
    navigate("/blog");
  };

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="w-full md:py-20 py-12 relative overflow-hidden bg-white">
      {/* Lisar Lines Decorations */}
      <LisarLines position="top-right" />
      {/* <LisarLines position="bottom-left" /> */}

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-medium text-black text-2xl md:text-3xl">
            News & Articles
          </h2>
          <button
            onClick={handleViewAll}
            className="text-[#235538] hover:text-[#1a4029] font-medium text-sm md:text-base flex items-center gap-2 transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Article - Large Card */}
          {featuredPosts[0] && (
            <div className="lg:row-span-2">
              <article
                onClick={() => handleArticleClick(featuredPosts[0].slug)}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                {/* Featured Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={featuredPosts[0].coverImage}
                    alt={featuredPosts[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-[#C7EF6B] text-[#060E0A] text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-medium text-[#235538] bg-[#F8FFF0] px-3 py-1 rounded-full">
                      {featuredPosts[0].category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {featuredPosts[0].readingTime} min read
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-[#235538] transition-colors">
                    {featuredPosts[0].title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                    {featuredPosts[0].excerpt}
                  </p>

                  <div className="mt-auto">
                    <span className="inline-flex items-center text-[#235538] font-medium group-hover:gap-3 transition-all">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* Secondary Articles - Two Smaller Cards */}
          <div className="space-y-8">
            {featuredPosts.slice(1).map((article) => (
              <article
                key={article.id}
                onClick={() => handleArticleClick(article.slug)}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                {/* Article Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-[#235538] bg-[#F8FFF0] px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {article.readingTime} min
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#235538] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2 text-sm">
                    {article.excerpt}
                  </p>

                  <span className="inline-flex items-center text-[#235538] font-medium text-sm group-hover:gap-2 transition-all">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
