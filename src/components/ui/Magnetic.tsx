'use client';

import { useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticProps {
  children: ReactNode;
  /** Maximum pixels the element is pulled toward the pointer. */
  strength?: number;
  className?: string;
}

/**
 * Wraps any element so it drifts toward the pointer while hovered, then
 * springs back on exit. Purely decorative: pointer events pass through to
 * the child, and the effect is disabled when reduced motion is requested.
 */
export function Magnetic({ children, strength = 14, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    // Pointer position relative to the element centre, normalised to -1..1.
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setOffset({ x: relX * strength * 2, y: relY * strength * 2 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={offset}
      transition={{ type: 'spring', stiffness: 260, damping: 18, mass: 0.6 }}
      className={cn('inline-flex', className)}
    >
      {children}
    </motion.div>
  );
}
