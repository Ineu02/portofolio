'use client';

import { useEffect, useState } from 'react';

/**
 * Returns the current vertical scroll position in pixels.
 * Useful for scroll-driven animations and effects.
 */
export function useScrollPosition(): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
}

/**
 * Returns true when the user has scrolled past the threshold.
 * Commonly used to show/hide sticky navigation or a back-to-top button.
 */
export function useScrollThreshold(threshold = 100): boolean {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    const handleScroll = () => setPassed(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return passed;
}

/**
 * Tracks which section is currently in view and returns its hash (e.g.
 * `'#projects'`). Lets the navigation highlight the reader's position and
 * expose it to assistive tech via `aria-current`.
 *
 * Uses a single IntersectionObserver over all sections rather than a scroll
 * listener, so it stays off the main thread during scrolling. The root margin
 * biases the "active" band toward the upper-middle of the viewport, which is
 * where a reader's attention sits.
 */
export function useActiveSection(hashes: string[]): string {
  const [active, setActive] = useState(hashes[0] ?? '');

  useEffect(() => {
    const sections = hashes
      .map((hash) => document.querySelector(hash))
      .filter((el): el is Element => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActive(`#${visible.target.id}`);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [hashes]);

  return active;
}
