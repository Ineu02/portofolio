import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { profile } from '@/lib/data';
import { SITE_URL } from '@/lib/site';

/* -------------------------------------------------------------------- */
/* Fonts — loaded via next/font for zero layout shift & self-hosting     */
/* -------------------------------------------------------------------- */

/**
 * Inter and Playfair are left to fetch their variable fonts.
 *
 * Pinning them to the four weights the site actually uses was tried and
 * measured: Google returns byte-identical files either way (Inter's Latin
 * subset stays 48,432 bytes, Playfair's 38,460), so naming the weights bought
 * nothing while adding a trap — a weight class added later and not listed here
 * would be synthesised by the browser into a smeared fake bold.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

/**
 * JetBrains Mono is the one family where naming the weights pays.
 *
 * Its variable font spans 100–800; clamped to the 400–700 the site uses, the
 * Latin subset drops from 40,480 to 31,340 bytes. The whole site only ever uses
 * `font-medium`, `font-semibold`, `font-bold`, and the 400 default — but if a
 * fifth weight is introduced anywhere, it must be added to this list, or the
 * browser will synthesise it instead of rendering the real face.
 */
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

/**
 * Canonical title and description, shared by the document head, Open Graph, and
 * the Twitter card so all three tell a search result or a shared link the same
 * story. Both describe the work as independent, which is what it is.
 */
const SITE_TITLE = 'Bandidoz — Web3 Security, AI Agents & Blockchain Infrastructure';
const SITE_DESCRIPTION =
  'Independent Web3 security researcher and AI engineer building autonomous agents, blockchain infrastructure, security tooling, and Web3 automation systems.';

/* -------------------------------------------------------------------- */
/* SEO metadata                                                          */
/* -------------------------------------------------------------------- */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${profile.name}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'Blockchain Security',
    'AI Agent Developer',
    'Web3 Builder',
    'Bug Hunter',
    'Smart Contract Security',
    'Airdrop Hunter',
    'Decentralized Technologies',
    'Security Researcher',
    'Autonomous AI Agents',
    'LLM Engineering',
  ],
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: profile.name,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${profile.name} — ${profile.role}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: '@maxwelxyz',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

/**
 * JSON-LD structured data helps search engines understand the person
 * behind the portfolio — improves rich results.
 */
function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    url: SITE_URL,
    email: profile.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location,
    },
    /**
     * External profiles only. `sameAs` is for other pages that represent the
     * same person, so the site's own origin does not belong here — that is what
     * `url` above is for. It previously listed `bandidoz.xyz`, which was both
     * redundant with `url` and, once that host went down, a dead reference
     * handed straight to a crawler.
     */
    sameAs: [
      'https://github.com/Ineu02',
      'https://www.linkedin.com/in/bandidoz-x-904720240/',
      'https://x.com/maxwelxyz',
      'https://t.me/chandrairawa',
    ],
  };
  return (
    <script
      type="application/ld+json"
      // Structured data must be injected as raw JSON.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Without JavaScript the page would render blank.
          Framer Motion serialises each reveal's `hidden` variant into the
          server-rendered markup as an inline style, so roughly a hundred
          elements — the headline among them — ship as `opacity:0` waiting for a
          script to animate them up. The prose is all there in the HTML; it is
          simply invisible. This block, which only applies when scripting is off,
          neutralises those three properties so the page reads as static text.

          `!important` is required: these are inline styles, and nothing else
          outranks them. The selector only matches elements that actually carry an
          inline opacity — a reveal waiting to fire — and excludes `aria-hidden`
          ones, which are the glare sheens and gradient washes that are *meant* to
          sit at zero until hovered. Revealing those would paint decoration over
          the cards instead of uncovering text.

          Note this covers scripting-disabled only. A visitor whose JS is merely
          slow still waits for hydration — the fix for that case is the shortened
          delays in `animations.ts` and `AppShell`, not a stylesheet.
        */}
        {/*
          The rules must be wrapped in a real `<style>` element. `<noscript>`
          content is parsed as markup once scripting is off, so bare CSS text
          here would be rendered as a line of visible gibberish at the top of the
          page rather than applied.
        */}
        <noscript>
          <style
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html:
                'header,main{opacity:1!important}' +
                'header [style*="opacity"]:not([aria-hidden="true"]),' +
                'main [style*="opacity"]:not([aria-hidden="true"])' +
                '{opacity:1!important;transform:none!important;filter:none!important}',
            }}
          />
        </noscript>
      </head>
      <body>
        <StructuredData />
        {/* Skip link for keyboard & screen-reader users */}
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
