import { useNavigate } from "react-router-dom";
import { LisarLines } from "./lisar-lines";
import { Clock, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { blogService } from "@/services/blog";
import { BlogPost } from "@/types/blog";

const NewsSection = () => {
  const navigate = useNavigate();
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setIsLoading(true);
        const response = await blogService.getFeaturedPosts(2);
        if (response.success && response.data) {
          const posts = Array.isArray(response.data)
            ? response.data
            : response.data.posts || [];
          setFeaturedPosts(Array.isArray(posts) ? posts : []);
        }
      } catch (error) {
        console.error("Error fetching featured posts:", error);
        setFeaturedPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  const handleArticleClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const handleViewAll = () => {
    navigate("/blog");
  };

  return (
    <section className="w-full md:py-20 py-12 relative overflow-hidden bg-white">
      {/* Lisar Lines Decorations */}
      <LisarLines position="top-right" />
      {/* <LisarLines position="bottom-left" /> */}

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Section Title */}
        <div className="flex justify-center mb-8">
          <span className="text-xl text-black font-medium">
            News & Articles
          </span>
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#235538]"></div>
          </div>
        ) : Array.isArray(featuredPosts) && featuredPosts.length > 0 ? (
          <div className="flex flex-row gap-8">
            {/* Articles */}
            {featuredPosts.map((article) => (
              <article
                key={article.id}
                onClick={() => handleArticleClick(article.slug)}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group flex-1"
              >
                {/* Article Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.cover_image}
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
                      {article.reading_time} min
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
                    <ArrowRight className="w-5 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No articles available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsSection;
