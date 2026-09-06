'use client';

import { motion } from 'framer-motion';
import { AmbientBackground } from './AmbientBackground';
import { LoadingScreen } from './LoadingScreen';
import { CustomCursor } from './CustomCursor';
import { ScrollProgress } from './ScrollProgress';
import { BackToTop } from './BackToTop';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/**
 * Client shell that wraps every page. It provides the global chrome —
 * ambient background, loading screen, custom cursor, scroll progress, sticky
 * nav, back-to-top, footer — and a subtle page-transition fade for the main
 * content.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
        One fixed atmosphere layer behind everything, rather than a background
        per section. Sections then only need their own local accents, and the
        depth stays continuous across boundaries instead of resetting at each.
      */}
      <AmbientBackground />
      <LoadingScreen />
      <CustomCursor />
      <ScrollProgress />
      <Navbar />

      {/*
        Page-transition fade-in for main content. The `#home` anchor lives on
        the hero section rather than here, so scroll-position tracking measures
        the hero instead of the full-page wrapper.

        This wrapper was the single heaviest contributor to the site feeling
        slow, and it was invisible as such because it is not in any section: it
        held *everything* at `opacity: 0` for 0.4s and then took 0.8s to fade,
        so no per-section delay below it could matter — the hero's headline
        could finish its own entrance and still not be on screen. It also
        shipped that `opacity:0` into the server HTML on `<main>` itself, so a
        hydration failure blanked the entire page from one attribute.

        Kept as a fade, because the cross-fade with the loading overlay is what
        stops the hand-off from being a hard cut, but with no delay, a quarter
        of the duration, and a floor above zero.
      */}
      <motion.main
        initial={{ opacity: 0.001 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.main>

      <Footer />
      <BackToTop />
    </>
  );
}
