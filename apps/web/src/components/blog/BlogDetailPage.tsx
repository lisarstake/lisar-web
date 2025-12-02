import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Tag, Share2 } from "lucide-react";
import { mockBlogPosts } from "@/mock/blog";
import { formatDistanceToNow, format } from "date-fns";
import Navbar from "@/components/general/nav-bar";
import Footer from "@/components/general/footer";
import ReactMarkdown from "react-markdown";
import { BlogCard } from "./BlogCard";

export const BlogDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();

  const post = useMemo(() => {
    return mockBlogPosts.find((p) => p.slug === slug);
  }, [slug]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return mockBlogPosts
      .filter((p) => p.id !== post.id && p.category === post.category)
      .slice(0, 3);
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Article Not Found
          </h1>
          <button
            onClick={() => navigate("/blog")}
            className="px-6 py-3 bg-[#C7EF6B] text-[#060E0A] rounded-lg font-medium hover:bg-[#b5dd59] transition-colors"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const formattedDate = format(new Date(post.publishedAt), "MMMM dd, yyyy");
  const relativeDate = formatDistanceToNow(new Date(post.publishedAt), {
    addSuffix: true,
  });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: url,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Back Button */}
      {/* <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <button
          onClick={() => navigate("/blog")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#235538] transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium">Return</span>
        </button>
      </div> */}

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Cover Image */}
        <div className="mb-8 sm:mb-12 rounded-xl sm:rounded-2xl overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-8 sm:mt-12 mb-4 sm:mb-6">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-6 sm:mt-10 mb-3 sm:mb-4">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-6 sm:mt-8 mb-2 sm:mb-3">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mt-4 sm:mt-6 mb-2">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-gray-700 mb-6 space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 leading-relaxed">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-700">{children}</em>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[#C7EF6B] pl-6 py-2 my-6 italic text-gray-600 bg-[#F8FFF0] rounded-r-lg">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 text-[#235538] px-2 py-1 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-[#235538] hover:text-[#1a4029] underline font-medium"
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel={
                    href?.startsWith("http") ? "noopener noreferrer" : undefined
                  }
                >
                  {children}
                </a>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#F8FFF0] to-white">
        <div className="max-w-4xl mx-auto text-center rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Ready to Start Staking?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
            Join thousands of users already earning rewards with Lisar
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="px-6 sm:px-8 py-3 bg-[#235538] text-white rounded-lg font-medium hover:bg-[#1a4029] transition-colors text-sm sm:text-base"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/blog")}
              className="px-6 sm:px-8 py-3 bg-white border-2 border-gray-200 text-gray-900 rounded-lg font-medium hover:border-gray-300 transition-colors text-sm sm:text-base"
            >
              Read More 
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
