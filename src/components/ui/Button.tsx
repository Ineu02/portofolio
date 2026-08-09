'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap';

const variants: Record<Variant, string> = {
  primary:
    'bg-gold-gradient text-background shadow-gold hover:shadow-gold-lg',
  secondary:
    'glass-strong text-ink hover:border-gold/40 hover:text-white',
  ghost: 'text-ink-muted hover:text-white',
  outline:
    'border border-gold/40 text-gold hover:bg-gold/10 hover:border-gold',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
};

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

/** Motion-enhanced button with a subtle press/hover spring. */
export const Button = forwardRef<
  HTMLButtonElement,
  ButtonBaseProps & HTMLMotionProps<'button'>
>(({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
});
Button.displayName = 'Button';

interface ButtonLinkProps extends ButtonBaseProps {
  href: string;
  external?: boolean;
  children: React.ReactNode;
  'aria-label'?: string;
  onClick?: () => void;
}

/** Anchor styled identically to Button — for internal & external links. */
export function ButtonLink({
  href,
  external,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <motion.span
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={classes}
    >
      {children}
    </motion.span>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {content}
    </Link>
  );
}
