'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

/**
 * Site-wide ambient background.
 *
 * Sits behind every section as one fixed layer rather than being repeated per
 * section, so the depth is continuous as you scroll instead of restarting at
 * each boundary. Three layers, all understated:
 *
 *   1. A faint network grid whose lines converge toward a vanishing point, so
 *      the page reads as having a floor rather than a flat backdrop.
 *   2. Two large colour washes — gold and violet — that drift apart slowly.
 *   3. A very small number of drifting motes.
 *
 * The whole thing is capped at low opacity. It should register as atmosphere
 * you notice only if you look for it; anything stronger competes with the
 * content for attention, which is the failure mode the brief warns against.
 */

/** Deterministic PRNG so server and client agree — `Math.random()` would not. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Motes, generated once at module scope so they never shift between renders. */
const MOTES = (() => {
  const rand = seeded(1337);
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: rand() * 100,
    top: rand() * 100,
    size: 1 + rand() * 2,
    duration: 18 + rand() * 22,
    delay: rand() * 10,
    drift: 20 + rand() * 40,
    opacity: 0.10 + rand() * 0.22,
  }));
})();

export function AmbientBackground() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll();

  // The grid drifts a little as the page scrolls, which gives parallax against
  // the content without moving enough to be read as its own animation.
  const gridShift = useSpring(useTransform(scrollYProgress, [0, 1], [0, -80]), {
    stiffness: 60,
    damping: 30,
  });
  const washShift = useSpring(useTransform(scrollYProgress, [0, 1], [0, 140]), {
    stiffness: 40,
    damping: 32,
  });
  // Counter-drift for the second wash, so the two separate as the page moves.
  // Declared here rather than inline in the JSX because it is a hook: calling
  // it inside a conditional style prop would make the hook order depend on
  // `reduced`, which breaks the rules of hooks.
  const washShiftInverse = useTransform(washShift, (v) => -v * 0.7);

  // Pointer position feeds a CSS variable rather than React state: this updates
  // on every mouse move, and re-rendering the tree at that rate would be
  // wasteful when only a gradient's centre needs to change.
  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    let x = 50;
    let y = 50;
    let targetX = 50;
    let targetY = 50;

    const onMove = (e: PointerEvent) => {
      targetX = (e.clientX / window.innerWidth) * 100;
      targetY = (e.clientY / window.innerHeight) * 100;
    };

    const tick = () => {
      // Ease toward the pointer so the wash lags slightly behind it, which
      // reads as a heavy light source rather than a cursor-following blob.
      x += (targetX - x) * 0.045;
      y += (targetY - y) * 0.045;
      el.style.setProperty('--pointer-x', `${x}%`);
      el.style.setProperty('--pointer-y', `${y}%`);
      frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
      style={{ ['--pointer-x' as string]: '50%', ['--pointer-y' as string]: '40%' }}
    >
      {/* Base wash. Anchors the palette so sections never sit on flat black. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 80% at 50% -10%, rgba(212,175,55,0.055), transparent 60%), radial-gradient(90% 60% at 85% 110%, rgba(139,122,255,0.045), transparent 65%)',
        }}
      />

      {/* Pointer-tracked highlight, desktop only — there is no pointer to track
          on a touch device, and the extra painted layer is pure cost there. */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            'radial-gradient(38rem 38rem at var(--pointer-x) var(--pointer-y), rgba(212,175,55,0.030), transparent 70%)',
        }}
      />

      {/* Perspective network floor. The mask fades it out before it reaches the
          top of the viewport, so it suggests a horizon instead of ending.

          The 60px pitch deliberately matches `.grid-pattern` in globals.css.
          Sections still using that utility overlap this layer, and two grids at
          different pitches would beat against each other — a moiré that reads
          as a rendering fault rather than as texture. */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[70vh] opacity-[0.55]"
        style={{
          y: reduced ? 0 : gridShift,
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.06) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'linear-gradient(to top, #000 0%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to top, #000 0%, transparent 85%)',
        }}
      />

      {/* Two slow colour washes, drifting in opposite directions. */}
      <motion.div
        className="absolute left-[-10%] top-[20%] h-[34rem] w-[34rem] rounded-full blur-[160px]"
        style={{
          y: reduced ? 0 : washShift,
          background: 'radial-gradient(circle, rgba(212,175,55,0.10), transparent 70%)',
        }}
      />
      <motion.div
        className="absolute right-[-8%] top-[55%] h-[30rem] w-[30rem] rounded-full blur-[170px]"
        style={{
          y: reduced ? 0 : washShiftInverse,
          background: 'radial-gradient(circle, rgba(139,122,255,0.09), transparent 70%)',
        }}
      />

      {/* Drifting motes. Half are dropped below `sm` — each is its own animated
          layer, and a phone is already carrying the hero canvas. */}
      {!reduced &&
        MOTES.map((m, i) => (
          <motion.span
            key={m.id}
            className={`absolute rounded-full bg-gold ${i % 2 === 1 ? 'hidden sm:block' : ''}`}
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: m.size,
              height: m.size,
            }}
            animate={{
              y: [0, -m.drift, 0],
              opacity: [m.opacity * 0.3, m.opacity, m.opacity * 0.3],
            }}
            transition={{
              duration: m.duration,
              delay: m.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

      {/* Vignette. Pulls the eye toward the centre column where the text is. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 100% at 50% 50%, transparent 55%, rgba(5,5,5,0.65) 100%)',
        }}
      />
    </div>
  );
}
