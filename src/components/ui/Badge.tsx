import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gold';
}

/** Small pill label used for tech stacks, categories, and tags. */
export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        variant === 'gold'
          ? 'border-gold/40 bg-gold/10 text-gold'
          : 'border-white/10 bg-white/5 text-ink-muted',
        className
      )}
    >
      {children}
    </span>
  );
}
