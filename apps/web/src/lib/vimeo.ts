/**
 * Vimeo utility functions for handling video thumbnails and embeds
 */

/**
 * Extract Vimeo video ID from various Vimeo URL formats
 * @param url - Vimeo URL (e.g., "https://vimeo.com/123456789" or "https://player.vimeo.com/video/123456789")
 * @returns Vimeo video ID or null if invalid
 */
export const extractVimeoId = (url: string): string | null => {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
    /vimeo\.com\/channels\/[^\/]+\/(\d+)/,
    /vimeo\.com\/groups\/[^\/]+\/videos\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

/**
 * Get Vimeo thumbnail URL
 * @param videoId - Vimeo video ID
 * @param size - Thumbnail size (default: '640x360')
 * @returns Thumbnail URL
 */
export const getVimeoThumbnail = (videoId: string, size: string = '640x360'): string => {
  return `https://vumbnail.com/${videoId}.jpg`;
};

/**
 * Get Vimeo embed URL
 * @param videoId - Vimeo video ID
 * @param options - Embed options
 * @returns Embed URL
 */
export const getVimeoEmbedUrl = (
  videoId: string,
  options: {
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
    title?: boolean;
    portrait?: boolean;
    byline?: boolean;
  } = {}
): string => {
  const {
    autoplay = false,
    muted = false,
    loop = false,
    controls = true,
    title = true,
    portrait = true,
    byline = true,
  } = options;

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    muted: muted ? '1' : '0',
    loop: loop ? '1' : '0',
    controls: controls ? '1' : '0',
    title: title ? '1' : '0',
    portrait: portrait ? '1' : '0',
    byline: byline ? '1' : '0',
    api: '1', // Enable JavaScript API
  });

  return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
};

/**
 * Get Vimeo video duration (requires API call - placeholder for now)
 * @param videoId - Vimeo video ID
 * @returns Promise with duration in seconds
 */
export const getVimeoDuration = async (videoId: string): Promise<number> => {
  // This would require Vimeo API integration
  // For now, return a placeholder
  return 0;
};

/**
 * Format duration from seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
