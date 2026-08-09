'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { profile } from '@/lib/data';

/** Never hold the overlay longer than this, even if `load` is slow to fire. */
const MAX_HOLD_MS = 1200;

/**
 * Brief full-screen overlay shown on first paint: an initials monogram over a
 * progress line that tracks real document readiness rather than a simulated
 * timer, so the page is never gated for longer than it actually needs.
 *
 * It dismisses on `window.load`, or at `MAX_HOLD_MS`, whichever comes first,
 * and skips itself entirely when the document has already loaded (client-side
 * navigations, cache hits) or when the visitor prefers reduced motion.
 */
export function LoadingScreen() {
  const reduced = useReducedMotion();

  // Start hidden and only opt in once we know the document is still loading.
  // This keeps the overlay out of the way for cached and instant loads.
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced || document.readyState === 'complete') return;

    setLoading(true);
    setProgress(15);

    // Ease toward 90% while assets are in flight; `load` completes the rest.
    const ticker = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + (90 - prev) * 0.12));
    }, 80);

    const dismiss = () => {
      clearInterval(ticker);
      setProgress(100);
      setLoading(false);
    };

    window.addEventListener('load', dismiss, { once: true });
    const cap = setTimeout(dismiss, MAX_HOLD_MS);

    return () => {
      clearInterval(ticker);
      clearTimeout(cap);
      window.removeEventListener('load', dismiss);
    };
  }, [reduced]);

  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('');

  const rounded = Math.round(progress);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[200] grid place-items-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
          aria-label="Loading the page"
        >
          <div className="grid-pattern absolute inset-0 opacity-30" aria-hidden />

          <div className="relative flex flex-col items-center gap-8">
            {/* Monogram */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid h-24 w-24 place-items-center rounded-2xl glass-strong"
            >
              <span className="font-display text-4xl font-bold text-gold-gradient">
                {initials}
              </span>
              <motion.span
                className="absolute inset-0 rounded-2xl border border-gold/40"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              />
            </motion.div>

            {/* Progress line */}
            <div
              className="h-px w-48 overflow-hidden bg-white/10"
              role="progressbar"
              aria-valuenow={rounded}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <motion.div
                className="h-full bg-gold-gradient"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'linear' }}
              />
            </div>

            <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink-faint">
              {rounded}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
