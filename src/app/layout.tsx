import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { profile } from '@/lib/data';

/* -------------------------------------------------------------------- */
/* Fonts — loaded via next/font for zero layout shift & self-hosting     */
/* -------------------------------------------------------------------- */
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

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = 'https://bandidoz.xyz';

/**
 * Canonical title and description, shared by the document head, Open Graph, and
 * the Twitter card so all three tell a search result or a shared link the same
 * story. Both describe the work as independent, which is what it is.
 */
const SITE_TITLE = 'Kenzi — Web3 Security, AI Agents & Blockchain Infrastructure';
const SITE_DESCRIPTION =
  'Independent Web3 security researcher and AI engineer building autonomous agents, blockchain infrastructure, security tooling, and Web3 automation systems.';

/* -------------------------------------------------------------------- */
/* SEO metadata                                                          */
/* -------------------------------------------------------------------- */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
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
    canonical: siteUrl,
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
    url: siteUrl,
    email: profile.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.location,
    },
    sameAs: [
      'https://github.com/Ineu02',
      'https://www.linkedin.com/in/bandidoz-x-904720240/',
      'https://x.com/maxwelxyz',
      'https://t.me/chandrairawa',
      'https://bandidoz.xyz',
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
