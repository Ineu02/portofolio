'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  /** Adds an animated gold gradient border. */
  gold?: boolean;
  /** Enables a lift-on-hover interaction. */
  interactive?: boolean;
}

/**
 * Frosted-glass surface used throughout the site. Optionally shows a
 * gold gradient border and a hover lift for interactive cards.
 */
export function GlassCard({
  gold = false,
  interactive = false,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass relative overflow-hidden rounded-2xl',
        gold && 'gold-border',
        interactive &&
          'transition-shadow duration-500 hover:shadow-glass',
        className
      )}
      {...(interactive
        ? { whileHover: { y: -6 }, transition: { type: 'spring', stiffness: 300, damping: 24 } }
        : {})}
      {...props}
    >
      {children}
    </motion.div>
  );
}
