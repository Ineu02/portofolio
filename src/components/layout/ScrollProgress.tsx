'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * Thin gold progress bar fixed to the top of the viewport that fills as
 * the user scrolls through the page. Uses Framer's scroll progress with
 * a spring for a smooth, non-jittery feel.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[120] h-0.5 origin-left bg-gold-gradient"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
