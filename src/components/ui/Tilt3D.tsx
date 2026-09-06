'use client';

import { useCallback, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Wraps content in a pointer-tracked 3D tilt.
 *
 * The card rotates toward the cursor on two axes and lifts slightly on Z, with
 * a cursor-following highlight that reads as a light source moving across a
 * physical surface. Children can opt into deeper parallax by declaring their
 * own `translateZ` — the wrapper establishes the perspective they sit inside.
 *
 * WHY SPRINGS AND NOT TRANSITIONS: a CSS transition on rotate would lag one
 * duration behind every pointer move, which feels like drag rather than
 * response. Springs settle continuously toward a moving target, so the tilt
 * tracks the cursor and still eases when it stops.
 *
 * The default `maxTilt` is deliberately small. Past roughly 10 degrees the
 * text on a card starts to look distorted rather than angled, which is the
 * point where the effect stops reading as premium and starts reading as a
 * gimmick.
 */
export interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees on each axis. */
  maxTilt?: number;
  /** How far the card lifts toward the viewer on hover, in pixels. */
  lift?: number;
  /** Perspective depth. Lower values exaggerate the effect. */
  perspective?: number;
  /** Renders a cursor-following specular highlight. */
  glare?: boolean;
}

export function Tilt3D({
  children,
  className,
  maxTilt = 7,
  lift = 10,
  perspective = 1100,
  glare = true,
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  // -0.5..0.5 relative to the card's own box.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hovered = useMotionValue(0);

  const spring = { stiffness: 220, damping: 26, mass: 0.6 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const sh = useSpring(hovered, { stiffness: 180, damping: 28 });

  // Vertical pointer movement drives rotateX, horizontal drives rotateY —
  // and rotateX is negated so the card tips *toward* the cursor. Getting this
  // sign wrong is what makes a tilt feel subtly wrong without being obvious.
  const rotateX = useTransform(sy, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const translateZ = useTransform(sh, [0, 1], [0, lift]);
  const glareOpacity = useTransform(sh, [0, 1], [0, 0.14]);
  // Hoisted out of the JSX: this is a hook, and calling it inside the `glare &&`
  // branch would change the hook order between a glare and a non-glare card.
  const glareBackground = useTransform(
    [sx, sy],
    ([x, y]: number[]) =>
      `radial-gradient(circle at ${50 + x * 100}% ${50 + y * 100}%, rgba(246,236,196,0.9), transparent 55%)`
  );

  const handleMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      px.set((e.clientX - rect.left) / rect.width - 0.5);
      py.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [px, py]
  );

  const handleEnter = useCallback(() => hovered.set(1), [hovered]);

  const handleLeave = useCallback(() => {
    hovered.set(0);
    // Return to flat rather than freezing at the last angle, so a card left
    // by a fast pointer does not stay stuck mid-tilt.
    px.set(0);
    py.set(0);
  }, [hovered, px, py]);

  // Reduced motion: render the children untouched. No wrapper transform, no
  // listeners, no springs — the card is simply a card.
  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn('[transform-style:preserve-3d]', className)} style={{ perspective }}>
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        style={{ rotateX, rotateY, translateZ, transformStyle: 'preserve-3d' }}
        className="relative h-full [transform-style:preserve-3d]"
      >
        {children}

        {/*
          The glare is `opacity: 0` at rest by design — it is a hover affordance,
          not content, and `aria-hidden` decoration that never holds text. Unlike
          the reveal variants there is nothing here to lose if JS never runs, so
          a true zero is correct.
        */}
        {glare && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ opacity: glareOpacity, background: glareBackground }}
          />
        )}
      </motion.div>
    </div>
  );
}
