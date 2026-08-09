'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OrbitRingProps {
  /** Items placed evenly around the ring. */
  items: ReactNode[];
  /** Ring radius as a percentage of the container's size. */
  radius?: number;
  /** Seconds for one full revolution. */
  duration?: number;
  /** Orbit counter-clockwise instead of clockwise. */
  reverse?: boolean;
  /** Degrees to offset the first item, so stacked rings don't align. */
  startAngle?: number;
  /** Draws the circular guide track behind the items. */
  showTrack?: boolean;
  className?: string;
}

/**
 * The site's signature element: a slowly revolving ring of nodes.
 *
 * Items are positioned with percentage offsets so the ring scales with its
 * container, and each item counter-rotates at the same rate so labels and
 * icons stay upright while the ring turns. When reduced motion is requested
 * the ring renders static in its starting position rather than disappearing.
 */
export function OrbitRing({
  items,
  radius = 42,
  duration = 40,
  reverse = false,
  startAngle = -90,
  showTrack = true,
  className,
}: OrbitRingProps) {
  const reduced = useReducedMotion();
  const spin = reverse ? -360 : 360;

  const spinTransition = {
    duration,
    repeat: Infinity,
    ease: 'linear' as const,
  };

  return (
    <div
      className={cn('pointer-events-none absolute inset-0', className)}
      aria-hidden
    >
      {showTrack && (
        <div
          className="absolute rounded-full border border-gold/15"
          style={{
            inset: `${50 - radius}%`,
          }}
        />
      )}

      <motion.div
        className="absolute inset-0"
        animate={reduced ? undefined : { rotate: spin }}
        transition={reduced ? undefined : spinTransition}
      >
        {items.map((item, i) => {
          const angle = ((i / items.length) * 360 + startAngle) * (Math.PI / 180);
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;

          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${x}%`, top: `${y}%`, translateX: '-50%', translateY: '-50%' }}
              // Counter-rotate so contents stay level as the ring turns.
              animate={reduced ? undefined : { rotate: -spin }}
              transition={reduced ? undefined : spinTransition}
            >
              <div className="pointer-events-auto">{item}</div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
