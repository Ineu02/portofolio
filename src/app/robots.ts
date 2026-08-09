import type { MetadataRoute } from 'next';

/**
 * Robots directives for crawlers.
 *
 * `/api/` is disallowed because the contact route is a POST endpoint with
 * nothing to index — crawling it only produces 405s in the logs.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://bandidoz.xyz/sitemap.xml',
  };
}
