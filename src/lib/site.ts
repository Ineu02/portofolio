/**
 * The site's canonical origin, in exactly one place.
 *
 * WHY THIS MODULE EXISTS: the origin used to be written out by hand in four
 * separate files — `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, and
 * `profile.website` in `lib/data.ts` — plus twice more inside `lib/data.ts` as
 * link hrefs and once in `scripts/make-og-image.py`. When the domain moved, every
 * one of those copies was left pointing at `bandidoz.xyz`, whose host no longer
 * answers at all. The live site therefore spent that whole period telling
 * crawlers that its canonical URL, its sitemap, and its Open Graph URL all lived
 * on a dead origin, while rendering two clickable links to it. Deriving all of
 * them from this constant means the next move is a one-line change.
 *
 * NO TRAILING SLASH — every consumer appends its own path.
 *
 * WHY `www` AND NOT THE APEX: the apex is not a serving host. Measured against
 * production:
 *
 *     GET https://bandidoz.tech/                 → 308, Location: https://www.bandidoz.tech/
 *     GET https://bandidoz.tech/projects/hermes  → 308, Location: https://www.bandidoz.tech/projects/hermes
 *     GET https://www.bandidoz.tech/             → 200
 *
 * So the apex redirects, path-preserving, to `www`. Naming the apex here would
 * put a redirect in `<link rel="canonical">` and in all seven `<loc>` entries of
 * the sitemap — a canonical URL is supposed to be the final destination, and
 * sitemap URLs that 30x get reported as "Page with redirect" rather than indexed.
 * If the apex is ever made the serving host instead, flip this value and reverse
 * the redirect at the same time; the two must always agree.
 */
export const SITE_URL = 'https://www.bandidoz.tech';
