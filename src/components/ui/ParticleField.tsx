'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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

  if (reduced) return null;

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {particles.map((p, i) => (
        <motion.span
          key={p.id}
          className={cn(
            'absolute rounded-full bg-gold',
            // Roughly half the field is hidden below `sm`. A phone already
            // carries the 3D canvas, and each particle is its own animated
            // compositor layer — cutting the count is the cheapest real saving
            // available here, and at phone size the thinner field looks the
            // same anyway.
            i % 2 === 1 && 'hidden sm:block'
          )}
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
