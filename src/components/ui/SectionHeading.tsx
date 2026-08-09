'use client';

import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

/**
 * Consistent section header: a small gold eyebrow, a large display
 * title with an optional gold-gradient highlighted word, and a
 * supporting description. Animates into view on scroll.
 */
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn(
        'flex max-w-2xl flex-col gap-4',
        align === 'center' ? 'mx-auto items-center text-center' : 'items-start text-left',
        className
      )}
    >
      {eyebrow && (
        <motion.span
          variants={fadeUp}
          className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-gold"
        >
          <span className="h-px w-8 bg-gold/60" aria-hidden />
          {eyebrow}
        </motion.span>
      )}
      <motion.h2
        variants={fadeUp}
        className="font-display text-display-sm text-balance text-white"
      >
        {title}{' '}
        {highlight && <span className="text-gold-gradient">{highlight}</span>}
      </motion.h2>
      {description && (
        <motion.p
          variants={fadeUp}
          className="text-balance text-base leading-relaxed text-ink-muted sm:text-lg"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
