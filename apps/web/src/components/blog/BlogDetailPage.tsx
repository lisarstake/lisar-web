import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Clock, Calendar, Tag, Share2 } from "lucide-react";
import { blogService } from "@/services/blog";
import { formatDistanceToNow, format } from "date-fns";
import Navbar from "@/components/general/nav-bar";
import Footer from "@/components/general/footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BlogCard } from "./BlogCard";
import { BlogPost } from "@/types/blog";
import { trackBlogRead, trackPageView } from "@/lib/mixpanel";

export const BlogDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        const response = await blogService.getBlogPost(slug);

        if (response.success && response.data) {
          setPost(response.data);

          // Track blog article read
          trackBlogRead(
            response.data.id,
            response.data.title,
            response.data.category,
            response.data.reading_time
          );

          // Track page view with details
          trackPageView('Blog Article', {
            page_type: 'blog_detail',
            article_id: response.data.id,
            article_title: response.data.title,
            category: response.data.category,
          });

          // Fetch related posts by category
          const relatedResponse = await blogService.getBlogPosts({
            category: response.data.category,
            limit: 4,
          });

          if (relatedResponse.success && relatedResponse.data) {
          
            const posts = Array.isArray(relatedResponse.data)
              ? relatedResponse.data
              : relatedResponse.data.posts || [];

            if (Array.isArray(posts)) {
              const filtered = posts
                .filter((p) => p.id !== response.data!.id)
                .slice(0, 3);
              setRelatedPosts(filtered);
            }
          }
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    const text = post?.title || "Check out this article";

    if (navigator.share) {
      try {
        await navigator.share({
          title: text,
          url: url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#235538]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center min-h-[50vh]">
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
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = format(new Date(post.published_at), "MMMM dd, yyyy");
  const relativeDate = formatDistanceToNow(new Date(post.published_at), {
    addSuffix: true,
  });

  // Get the full URL for sharing
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lisar.io';
  
  // Ensure cover image is absolute URL for social sharing
  const absoluteCoverImage = post.cover_image?.startsWith('http')
    ? post.cover_image
    : `${siteUrl}${post.cover_image?.startsWith('/') ? '' : '/'}${post.cover_image}`;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{post.title} - Lisar Blog</title>
        <meta name="title" content={`${post.title} - Lisar Blog`} />
        <meta name="description" content={post.excerpt} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={`${post.title} - Lisar Blog`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={absoluteCoverImage} />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:author" content={post.author.name} />
        <meta property="article:section" content={post.category} />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={currentUrl} />
        <meta property="twitter:title" content={`${post.title} - Lisar Blog`} />
        <meta property="twitter:description" content={post.excerpt} />
        <meta property="twitter:image" content={absoluteCoverImage} />
        
        {/* Additional Meta Tags */}
        <meta name="author" content={post.author.name} />
        <meta name="keywords" content={post.tags.join(', ')} />
        <link rel="canonical" href={currentUrl} />
      </Helmet>
      
      <Navbar />

      {/* Main Content - flex-1 to push footer down */}
      <main className="flex-1">
        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 min-h-[400px]">
          {/* Back Button */}
          {/* <button
          onClick={() => navigate("/blog")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#235538] mb-6 sm:mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm sm:text-base">Back to Blog</span>
        </button> */}

          {/* Category Badge */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#F8FFF0] text-[#235538] text-xs sm:text-sm font-medium rounded-full">
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              {post.reading_time} min read
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
            {/* Author */}
            <div className="flex items-center gap-2 sm:gap-3">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-6 h-6 sm:w-10 sm:h-10 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-gray-900 text-xs sm:text-sm">
                  {post.author.name}
                </p>
                {post.author.role && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    {post.author.role}
                  </p>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 ml-auto">
              <Calendar className="w-4 h-4" />
              <div className="text-xs sm:text-sm">
                <span className="hidden sm:inline">{formattedDate}</span>
                <span className="sm:hidden">{relativeDate}</span>
              </div>
            </div>

            {/* Share Button */}
            {/* <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Share article"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button> */}
          </div>

          {/* Cover Image */}
          <div className="relative w-full h-64 sm:h-80 md:h-96 mb-8 sm:mb-12 rounded-xl sm:rounded-2xl overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Headings
                h1: ({ children }) => (
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 mt-8 sm:mt-10">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 mt-6 sm:mt-8">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3 mt-4 sm:mt-6">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 mt-4">
                    {children}
                  </h4>
                ),
                h5: ({ children }) => (
                  <h5 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 mt-3">
                    {children}
                  </h5>
                ),
                h6: ({ children }) => (
                  <h6 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mb-2 mt-3">
                    {children}
                  </h6>
                ),
                // Paragraphs
                p: ({ children }) => (
                  <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                    {children}
                  </p>
                ),
                // Lists
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-gray-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg text-gray-700">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="ml-4 sm:ml-6">{children}</li>
                ),
                // Blockquote
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#235538] pl-4 sm:pl-6 italic text-gray-700 my-4 sm:my-6 bg-gray-50 py-2">
                    {children}
                  </blockquote>
                ),
                // Code (inline)
                code: ({ inline, children }: any) => {
                  if (inline) {
                    return (
                  <code className="bg-gray-100 text-[#235538] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">
                    {children}
                  </code>
                    );
                  }
                  // Code block
                  return (
                    <code className="block bg-gray-900 text-gray-100 px-4 py-3 sm:px-6 sm:py-4 rounded-lg text-xs sm:text-sm font-mono overflow-x-auto my-4 sm:my-6">
                      {children}
                    </code>
                  );
                },
                // Pre (code block wrapper)
                pre: ({ children }) => (
                  <pre className="bg-gray-900 rounded-lg overflow-x-auto my-4 sm:my-6">
                    {children}
                  </pre>
                ),
                // Images
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt || "Article image"}
                    className="w-full h-auto rounded-xl sm:rounded-2xl my-6 sm:my-8 object-cover"
                  />
                ),
                // Links
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#235538] hover:text-[#1a4028] underline font-medium transition-colors"
                  >
                    {children}
                  </a>
                ),
                // Tables
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6 sm:my-8">
                    <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-gray-50 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 border-b border-gray-300">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm text-gray-700 border-b border-gray-200">
                    {children}
                  </td>
                ),
                // Horizontal Rule
                hr: () => (
                  <hr className="my-6 sm:my-8 border-t-2 border-gray-200" />
                ),
                // Strong (bold)
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-900">{children}</strong>
                ),
                // Emphasis (italic)
                em: ({ children }) => (
                  <em className="italic text-gray-800">{children}</em>
                ),
                // Strikethrough (requires remark-gfm)
                del: ({ children }) => (
                  <del className="line-through text-gray-500">{children}</del>
                ),
                // Task list items (requires remark-gfm)
                input: ({ checked, disabled }: any) => (
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    className="mr-2 rounded border-gray-300 text-[#235538] focus:ring-[#235538]"
                    readOnly
                  />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Related Articles */}
        {relatedPosts.length > 0 ? (
          <section className="bg-[#F8FFF0] py-12 sm:py-16 md:py-20 min-h-[300px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        ) : (
          <section className="bg-[#F8FFF0] py-12 sm:py-16 md:py-20 min-h-[300px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-8">
                <p className="text-base sm:text-lg text-gray-600">
                  No related articles found.
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
