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
    const siteUrl = env.VITE_SITE_URL || 'https://lisar.io';
    const currentUrl = `${siteUrl}/blog/${slug}`;
    
    // Ensure cover image is absolute URL
    const coverImageUrl = post.cover_image?.startsWith('http')
      ? post.cover_image
      : `${siteUrl}${post.cover_image?.startsWith('/') ? '' : '/'}${post.cover_image || '/lisar.png'}`;

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
    <meta name="twitter:site" content="@LisarGlobal" />

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
    console.error('Error generating OG page:', error);
    return context.next();
  }
};
