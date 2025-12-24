/**
 * Skeleton loader for blog cards
 */

export const BlogCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-100" />

      <div className="p-6 space-y-4">
        {/* Category and date skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-4 w-20 bg-gray-100 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-100 rounded w-full" />
          <div className="h-6 bg-gray-100 rounded w-3/4" />
        </div>

        {/* Excerpt skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loader for featured blog card (large card with image on left)
 */
export const FeaturedBlogCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse h-full">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Image skeleton */}
        <div className="w-full lg:w-1/2 h-64 lg:h-full bg-gray-100" />

        {/* Content skeleton */}
        <div className="w-full lg:w-1/2 p-8 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Category skeleton */}
            <div className="h-4 w-24 bg-gray-100 rounded" />

            {/* Title skeleton */}
            <div className="space-y-3">
              <div className="h-8 bg-gray-100 rounded w-full" />
              <div className="h-8 bg-gray-100 rounded w-4/5" />
            </div>

            {/* Excerpt skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          </div>

          {/* Footer skeleton */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-100 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-20 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loader for small text-only blog card
 */
export const SmallBlogCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse h-full flex flex-col justify-between">
      <div className="space-y-4">
        {/* Category skeleton */}
        <div className="h-4 w-20 bg-gray-100 rounded" />

        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-100 rounded w-full" />
          <div className="h-6 bg-gray-100 rounded w-3/4" />
        </div>

        {/* Excerpt skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
};

