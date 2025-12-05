import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPost } from '@/types/blog';
import { Clock, Calendar, Tag, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/blog/${post.slug}`);
  };

  const formattedDate = formatDistanceToNow(new Date(post.published_at), {
    addSuffix: true,
  });

  if (featured) {
    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
        {/* Featured Image */}
        <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#C7EF6B] text-[#060E0A] text-xs font-semibold rounded-full">
              Featured
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {/* Category & Reading Time */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[#235538]">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              {post.reading_time} min read
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-[#235538] transition-colors line-clamp-2">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Author & Date */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C7EF6B] flex items-center justify-center">
                  <span className="text-[#060E0A] font-semibold text-xs sm:text-sm">
                    {post.author.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  {post.author.name}
                </p>
                {post.author.role && (
                  <p className="text-xs text-gray-500 hidden sm:block">{post.author.role}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              {formattedDate}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      {/* Regular Image */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <img
          src={post.cover_image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Category & Reading Time */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#235538]">
            <Bookmark className="w-3 h-3" />
            {post.category}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {post.reading_time} min
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-[#235538] transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Author & Date */}
        <div className="flex justify-between items-center gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#C7EF6B] flex items-center justify-center">
                <span className="text-[#060E0A] font-semibold text-xs">
                  {post.author.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-900">
                {post.author.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
};

