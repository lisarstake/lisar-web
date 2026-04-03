/**
 * Cloudflare Pages Function for dynamic blog post meta tags
 * This intercepts requests to /blog/[slug] and serves HTML with proper OG tags for crawlers
 */

interface Env {
  VITE_API_BASE_URL?: string;
  VITE_SITE_URL?: string;
}

interface BlogPost {
  title: string;
  excerpt: string;
  cover_image: string;
  published_at: string;
  author: {
    name: string;
  };
  category?: string;
  tags?: string[];
}

interface BlogApiResponse {
  success: boolean;
  data: BlogPost;
}

const getAbsoluteImageUrl = (image: string | undefined, siteUrl: string): string => {
  const fallback = `${siteUrl}/metaimage.png`;

  if (!image || image.trim().length === 0) {
    return fallback;
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  return image.startsWith('/') ? `${siteUrl}${image}` : `${siteUrl}/${image}`;
};

const getImageMimeType = (imageUrl: string): string => {
  const normalized = imageUrl.toLowerCase().split('?')[0];

  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  if (normalized.endsWith('.gif')) return 'image/gif';
  if (normalized.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const slug = params.slug as string;

  // Check if it's a bot/crawler
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /bot|crawler|spider|crawling|facebook|twitter|linkedin|whatsapp|telegram|slack|discord|facebot|twitterbot/i.test(userAgent);

  // If not a bot, serve the regular SPA
  if (!isBot) {
    return context.next();
  }

  try {
    // Fetch blog post data from your API
    const apiBaseUrl = env.VITE_API_BASE_URL || 'https://api.lisar.io';
    const apiUrl = `${apiBaseUrl}/blog/posts/${slug}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return context.next();
    }

    const result = (await response.json()) as BlogApiResponse;
    const post = result.data;

    if (!post) {
      return context.next();
    }

    // Build absolute URLs
    const siteUrl = env.VITE_SITE_URL || 'https://lisarstake.com';
    const currentUrl = `${siteUrl}/blog/${slug}`;
    
    // Ensure cover image is absolute URL - this is critical for social media.
    const coverImageUrl = getAbsoluteImageUrl(post.cover_image, siteUrl);
    const coverImageType = getImageMimeType(coverImageUrl);
 

    // Escape HTML entities
    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const title = escapeHtml(post.title);
    const excerpt = escapeHtml(post.excerpt || '');
    const authorName = escapeHtml(post.author?.name || 'Lisar');

    // Generate HTML with proper meta tags
    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />

    <!-- Primary Meta Tags -->
    <title>${title} - Lisar Blog</title>
    <meta name="title" content="${title} - Lisar Blog" />
    <meta name="description" content="${excerpt}" />
    <meta name="author" content="${authorName}" />
    ${post.tags ? `<meta name="keywords" content="${escapeHtml(post.tags.join(', '))}" />` : ''}

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${currentUrl}" />
    <meta property="og:title" content="${title} - Lisar Blog" />
    <meta property="og:description" content="${excerpt}" />
    <meta property="og:image" content="${coverImageUrl}" />
    <meta property="og:image:secure_url" content="${coverImageUrl}" />
    <meta property="og:image:type" content="${coverImageType}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:site_name" content="Lisar" />
    ${post.published_at ? `<meta property="article:published_time" content="${post.published_at}" />` : ''}
    <meta property="article:author" content="${authorName}" />
    ${post.category ? `<meta property="article:section" content="${escapeHtml(post.category)}" />` : ''}
    ${post.tags?.map((tag: string) => `<meta property="article:tag" content="${escapeHtml(tag)}" />`).join('\n    ') || ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${currentUrl}" />
    <meta name="twitter:title" content="${title} - Lisar Blog" />
    <meta name="twitter:description" content="${excerpt}" />
    <meta name="twitter:image" content="${coverImageUrl}" />
    <meta name="twitter:image:alt" content="${title}" />
    <meta name="twitter:site" content="@LisarGlobal" />
    <meta name="twitter:creator" content="@LisarGlobal" />

    <!-- Canonical -->
    <link rel="canonical" href="${currentUrl}" />
    
    <!-- Icon -->
    <link rel="icon" type="image/png" href="/lisar.png" />

    <!-- Redirect to actual page for crawlers that execute JS -->
    <meta http-equiv="refresh" content="0;url=/blog/${slug}" />
    <script>window.location.href = "/blog/${slug}";</script>
  </head>
  <body>
    <noscript>
      <p>Redirecting to <a href="/blog/${slug}">${title}</a>...</p>
    </noscript>
  </body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
   
    return context.next();
  }
};
