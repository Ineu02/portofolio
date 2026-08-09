'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

/**
 * Custom animated cursor: a small gold dot that tracks the pointer
 * exactly, plus a larger trailing ring that lags with spring physics
 * and expands over interactive elements. Disabled on touch devices and
 * when the user prefers reduced motion (native cursor is kept there).
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);

  // Raw pointer position for the dot.
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  // Springy position for the trailing ring.
  const ringX = useSpring(dotX, { stiffness: 350, damping: 28 });
  const ringY = useSpring(dotY, { stiffness: 350, damping: 28 });

  useEffect(() => {
    // Only enable on devices with a fine pointer and no reduced-motion pref.
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) return;

    setEnabled(true);
    document.documentElement.classList.add('cursor-none-desktop');

    const move = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      setVisible(true);
    };

    // Grow the ring when hovering clickable elements.
    const over = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setHovering(
        Boolean(
          target.closest('a, button, [role="button"], input, textarea, [data-cursor="hover"]')
        )
      );
    };

    const leave = () => setVisible(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    document.addEventListener('mouseleave', leave);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      document.removeEventListener('mouseleave', leave);
      document.documentElement.classList.remove('cursor-none-desktop');
    };
  }, [dotX, dotY]);

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Trailing ring */}
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[150] hidden rounded-full border border-gold/70 mix-blend-difference lg:block"
            style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
            animate={{
              width: hovering ? 56 : 34,
              height: hovering ? 56 : 34,
              opacity: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          />
          {/* Center dot */}
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[150] hidden h-1.5 w-1.5 rounded-full bg-gold lg:block"
            style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
            exit={{ opacity: 0 }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
