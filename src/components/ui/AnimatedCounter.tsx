'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

/**
 * Counts from 0 to `value` when scrolled into view, using a spring for
 * a natural ease-out. Respects reduced-motion by snapping to the value.
 */
export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1600, bounce: 0 });
  const [display, setDisplay] = useState(0);

  // Kick off the count once the element enters the viewport.
  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  // Sync the spring value into React state for rendering.
  useEffect(() => {
    const unsub = spring.on('change', (latest) => {
      setDisplay(Math.round(latest));
    });
    return () => unsub();
  }, [spring]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
