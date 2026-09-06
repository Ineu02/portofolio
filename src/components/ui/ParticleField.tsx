'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMediaQuery } from '@/lib/hooks';
import { cn } from '@/lib/utils';

/**
 * Deterministic pseudo-random generator. Using a fixed seed keeps the
 * particle layout identical on the server and the client, which avoids
 * hydration mismatches that `Math.random()` would cause.
 */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

interface ParticleFieldProps {
  /** How many particles to scatter. */
  count?: number;
  /** Changes the layout without changing the count. */
  seed?: number;
  className?: string;
}

/**
 * Ambient drifting particles used behind the hero. Rendered as absolutely
 * positioned dots with staggered float loops; hidden entirely for visitors
 * who prefer reduced motion.
 */
export function ParticleField({
  count = 26,
  seed = 7,
  className,
}: ParticleFieldProps) {
  const reduced = useReducedMotion();
  const wide = useMediaQuery('(min-width: 640px)');

  const particles = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 1.5 + rand() * 3,
      duration: 9 + rand() * 12,
      delay: rand() * 8,
      drift: 14 + rand() * 34,
      opacity: 0.15 + rand() * 0.4,
    }));
  }, [count, seed]);

  // Roughly half the field is dropped below `sm`. A phone already carries the
  // 3D canvas, and at that size the thinner field looks the same anyway.
  //
  // The half that goes is removed from the tree rather than hidden with
  // `hidden sm:block`, because framer-motion keeps ticking an infinite
  // animation on a `display: none` node: the CSS version had a phone paying for
  // fifteen animations it could not draw.
  const visible = useMemo(
    () => (wide ? particles : particles.filter((_, i) => i % 2 === 0)),
    [particles, wide]
  );

  if (reduced) return null;

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {visible.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-gold"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -p.drift, 0],
            opacity: [p.opacity * 0.35, p.opacity, p.opacity * 0.35],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
