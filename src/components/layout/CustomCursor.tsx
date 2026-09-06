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
    // Only enable where the cursor is actually drawn. Both elements below are
    // `hidden lg:block`, so the width check belongs here too — without it a
    // fine-pointer tablet ran the listeners and both springs to move two
    // elements CSS had already hidden.
    const supported = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!supported || reduced) return;

    setEnabled(true);
    document.documentElement.classList.add('cursor-none-desktop');

    // `visible` only ever goes true once per pointer entry, so the flag keeps
    // the state setter out of the move handler; calling it on every mouse move
    // asked React to re-check the tree at pointer rate to arrive at the value
    // it already held.
    let shown = false;
    let lastTarget: EventTarget | null = null;

    const move = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!shown) {
        shown = true;
        setVisible(true);
      }
    };

    // Grow the ring when hovering clickable elements.
    const over = (e: MouseEvent) => {
      // `mouseover` fires on every element boundary the pointer crosses, and
      // `closest` walks the ancestor chain each time. Re-entering the same node
      // cannot change the answer, so skip the walk for it.
      if (e.target === lastTarget) return;
      lastTarget = e.target;
      const target = e.target as HTMLElement;
      setHovering(
        Boolean(
          target.closest('a, button, [role="button"], input, textarea, [data-cursor="hover"]')
        )
      );
    };

    const leave = () => {
      shown = false;
      setVisible(false);
    };

    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
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
          {/*
            Trailing ring.

            No `mix-blend-difference` here, deliberately. A blend mode on a fixed
            element forces the compositor to re-read what is underneath and
            re-composite that region on every pointer move, and underneath this
            one is the whole page — including the hero canvas repainting on its
            own rAF. On a near-black page the difference blend was also doing
            almost nothing visible: gold against #050505 inverts to very nearly
            the same gold. A plain gold border at 70% is the same look without
            asking the compositor to prove it.
          */}
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[150] hidden rounded-full border border-gold/70 lg:block"
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
