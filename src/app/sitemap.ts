import type { MetadataRoute } from 'next';
import { projects } from '@/lib/data';
import { SITE_URL } from '@/lib/site';

/**
 * Generates sitemap.xml for search engines.
 *
 * Only real routes are listed. The previous version listed in-page hash
 * fragments (`/#about`, `/#projects`) as separate entries, which crawlers
 * either ignore or treat as duplicates of the home page, and it omitted the
 * six case-study routes that are the only genuinely indexable sub-pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date();

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${base}/projects/${project.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
