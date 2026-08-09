'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useScrollThreshold } from '@/lib/hooks';

/**
 * Floating button that appears after scrolling down and smoothly scrolls
 * back to the top of the page when clicked.
 */
export function BackToTop() {
  const show = useScrollThreshold(600);

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          onClick={scrollTop}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[120] grid h-12 w-12 place-items-center rounded-full glass-strong text-gold shadow-gold transition-colors hover:border-gold/50 sm:bottom-8 sm:right-8"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
