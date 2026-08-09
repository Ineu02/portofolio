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
      */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      >
        {children}
      </motion.main>

      <Footer />
      <BackToTop />
    </>
  );
}
