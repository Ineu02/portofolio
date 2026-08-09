'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  damp,
  faceNormal,
  fibonacciSphere,
  icosphere,
  mapRange,
  project,
  ring,
  rotateYX,
  shade,
  type Light,
  type Mesh,
  type Vec3,
} from '@/lib/scene3d';

/**
 * The hero's focal object: a slowly turning core built from a faceted inner
 * shell, a wireframe outer lattice, and two inclined orbital rings carrying
 * data motes.
 *
 * WHAT IT REPRESENTS: the lattice is a network — nodes joined by links, the
 * shape both a blockchain and a neural graph actually take. The solid inner
 * core is what the lattice protects. The rings are traffic moving around it.
 * It is abstract on purpose: a literal chain-link or padlock model would read
 * as a stock icon, and a glowing cube would read as a game asset.
 *
 * HOW IT MOVES: a constant slow yaw, a gentle vertical float, a damped lean
 * toward the pointer, and a scroll-linked rotation and lift that carries it
 * out of the way as the page moves on. Every response is damped, never
 * snapped — the difference between "premium" and "reactive" here is entirely
 * in the easing.
 *
 * ACCESSIBILITY: the canvas is `aria-hidden` and carries no information that
 * is not also in the surrounding text. Under `prefers-reduced-motion` it draws
 * exactly one static frame, so the composition survives but nothing moves.
 */

/** Tunables collected in one place so the look can be adjusted coherently. */
const CONFIG = {
  /** Camera distance along +Z, in scene units. */
  cameraDistance: 4.2,
  /** Focal length. Larger flattens perspective; this keeps a gentle depth cue. */
  fov: 2.35,
  coreRadius: 1,
  latticeRadius: 1.62,
  /** Radians per second of ambient yaw. Slow enough to read as drift. */
  yawSpeed: 0.16,
  /** How fast damped values converge. Higher is snappier. */
  pointerDamping: 2.6,
  scrollDamping: 5,
  /** Maximum pointer-driven lean, in radians (~9 degrees). */
  maxLean: 0.16,
} as const;

/** Key light: warm gold from the upper left, matching the page's accent. */
const KEY_LIGHT: Light = {
  direction: [-0.45, 0.72, 0.53],
  intensity: 0.85,
};

/**
 * Fill light: cool violet from below right. It is the secondary lighting the
 * brief asks for, and it does real work — the cool fill separates the object's
 * shaded side from the near-black page behind it.
 */
const FILL_LIGHT: Light = {
  direction: [0.62, -0.38, 0.68],
  intensity: 0.42,
};

/** Palette, kept as raw channels so alpha can vary per draw call. */
const GOLD = '212, 175, 55';
const GOLD_LIGHT = '246, 236, 196';
const VIOLET = '139, 122, 255';
const CYAN = '110, 190, 235';

interface Quality {
  /** Icosphere subdivision level for the lattice. */
  detail: number;
  /** Number of orbiting motes. */
  motes: number;
  /** Segments per orbital ring. */
  ringSegments: number;
  /** Upper bound on devicePixelRatio, to cap fill cost on dense screens. */
  maxDpr: number;
}

/**
 * Quality tiers by viewport width.
 *
 * Mobile gets a genuinely lighter scene rather than the same scene scaled
 * down: fewer subdivisions, fewer motes, and a DPR cap of 2. Fill rate, not
 * vertex count, is what costs on a phone, so the DPR cap matters more than
 * any of the geometry reductions.
 */
function qualityFor(width: number): Quality {
  if (width < 640) return { detail: 1, motes: 14, ringSegments: 48, maxDpr: 2 };
  if (width < 1024) return { detail: 1, motes: 20, ringSegments: 64, maxDpr: 2 };
  return { detail: 2, motes: 26, ringSegments: 90, maxDpr: 2 };
}

export interface HeroCoreProps {
  /** Extra classes for the wrapping element. */
  className?: string;
}

export function HeroCore({ className }: HeroCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let quality = qualityFor(window.innerWidth);
    let lattice: Mesh = icosphere(CONFIG.latticeRadius, quality.detail);
    let core: Mesh = icosphere(CONFIG.coreRadius, 1);
    let motes: Vec3[] = fibonacciSphere(quality.motes, CONFIG.latticeRadius * 1.5);
    let ringA: Vec3[] = ring(CONFIG.latticeRadius * 1.75, quality.ringSegments, 0.42);
    let ringB: Vec3[] = ring(CONFIG.latticeRadius * 2.05, quality.ringSegments, -0.72);

    // Live state. Targets are set by input; the rendered values chase them.
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let scrollTarget = 0;
    let scrollValue = 0;

    let width = 0;
    let height = 0;
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;
    let tabVisible = true;
    let onScreen = true;

    /**
     * Start or stop the loop from the two independent conditions that gate it.
     *
     * Centralised because the tab-visibility and on-screen checks would
     * otherwise each start their own loop, and two concurrent rAF chains would
     * double the frame rate and the CPU cost with no visible difference.
     */
    const sync = () => {
      const shouldRun = tabVisible && onScreen && !reduced;
      if (shouldRun && !frame) {
        // Reset the clock so the object resumes where it left off rather than
        // jumping by however long it was paused.
        lastTime = 0;
        frame = window.requestAnimationFrame(loop);
      } else if (!shouldRun && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Reset before scaling: setTransform is absolute, so repeated resizes
      // cannot compound the DPR scale the way a bare scale() call would.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Rebuild geometry if the breakpoint changed — rotating a phone should
      // get the tier appropriate to the new width, not keep the old one.
      const nextQuality = qualityFor(window.innerWidth);
      if (nextQuality.detail !== quality.detail || nextQuality.motes !== quality.motes) {
        quality = nextQuality;
        lattice = icosphere(CONFIG.latticeRadius, quality.detail);
        core = icosphere(CONFIG.coreRadius, 1);
        motes = fibonacciSphere(quality.motes, CONFIG.latticeRadius * 1.5);
        ringA = ring(CONFIG.latticeRadius * 1.75, quality.ringSegments, 0.42);
        ringB = ring(CONFIG.latticeRadius * 2.05, quality.ringSegments, -0.72);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      // Normalised to -1..1 about the viewport centre. Using the viewport
      // rather than the canvas means the object keeps responding while the
      // pointer is over the headline sitting on top of it.
      pointerTargetX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerTargetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const onPointerLeave = () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
    };

    const onScroll = () => {
      // 0 at the top of the page, 1 once a full viewport has scrolled past.
      scrollTarget = mapRange(window.scrollY, 0, window.innerHeight, 0, 1);
    };

    /**
     * Draw one frame.
     *
     * Order matters and is deliberate: far ring, lattice back half, solid
     * core, lattice front half, near ring, motes. Painting back-to-front is
     * what produces the sense that the rings pass behind the object, and it is
     * the cheapest correct answer without a depth buffer.
     */
    const draw = (time: number) => {
      const dt = lastTime === 0 ? 0.016 : Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      if (!reduced) elapsed += dt;

      pointerX = damp(pointerX, pointerTargetX, CONFIG.pointerDamping, dt);
      pointerY = damp(pointerY, pointerTargetY, CONFIG.pointerDamping, dt);
      scrollValue = damp(scrollValue, scrollTarget, CONFIG.scrollDamping, dt);

      const cx = width / 2;
      // Scroll lifts the object and shrinks it slightly as the page moves on,
      // so the hand-off to the next section reads as the camera pulling back
      // rather than the element simply being scrolled off screen.
      const lift = scrollValue * height * 0.28;
      const cy = height / 2 - lift;
      const zoom = 1 - scrollValue * 0.18;
      const fov = CONFIG.fov * Math.min(width, height) * 0.42 * zoom;

      const yaw =
        elapsed * CONFIG.yawSpeed +
        pointerX * CONFIG.maxLean * 2 +
        scrollValue * 0.9;
      const pitch =
        Math.sin(elapsed * 0.35) * 0.06 +
        -pointerY * CONFIG.maxLean +
        scrollValue * 0.35;
      const bob = reduced ? 0 : Math.sin(elapsed * 0.5) * height * 0.012;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      const toScreen = (v: Vec3) => {
        const r = rotateYX(v, yaw, pitch);
        const p = project(r, CONFIG.cameraDistance, fov, cx, cy + bob);
        return { r, p };
      };

      // --- Orbital rings -------------------------------------------------
      // Drawn as individual segments so each can be dimmed by its own depth.
      // A single stroked path would have to share one alpha and would lose the
      // pass-behind illusion entirely.
      const drawRing = (points: Vec3[], colour: string, base: number) => {
        for (let i = 0; i < points.length; i += 1) {
          const from = toScreen(points[i]);
          const to = toScreen(points[(i + 1) % points.length]);
          const depth = (from.p.depth + to.p.depth) / 2;
          const alpha =
            base *
            mapRange(depth, CONFIG.cameraDistance + 2, CONFIG.cameraDistance - 2, 0.12, 1);
          ctx.strokeStyle = `rgba(${colour}, ${alpha})`;
          ctx.lineWidth = mapRange(depth, CONFIG.cameraDistance + 2, CONFIG.cameraDistance - 2, 0.5, 1.4);
          ctx.beginPath();
          ctx.moveTo(from.p.x, from.p.y);
          ctx.lineTo(to.p.x, to.p.y);
          ctx.stroke();
        }
      };

      drawRing(ringB, VIOLET, 0.5);
      drawRing(ringA, GOLD, 0.62);

      // --- Solid core ----------------------------------------------------
      // Back-face culled and painted farthest-first. Culling roughly halves
      // the fill work and, more importantly, stops rear faces from lightening
      // front ones through the additive blend.
      const coreFaces = core.faces
        .map((f) => {
          const a = rotateYX(core.vertices[f.a], yaw, pitch);
          const b = rotateYX(core.vertices[f.b], yaw, pitch);
          const c = rotateYX(core.vertices[f.c], yaw, pitch);
          const normal = faceNormal(a, b, c);
          const depth = CONFIG.cameraDistance - (a[2] + b[2] + c[2]) / 3;
          return { a, b, c, normal, depth };
        })
        .filter((f) => f.normal[2] > -0.05)
        .sort((p, q) => q.depth - p.depth);

      for (const f of coreFaces) {
        const light = shade(f.normal, KEY_LIGHT, FILL_LIGHT);
        const pa = project(f.a, CONFIG.cameraDistance, fov, cx, cy + bob);
        const pb = project(f.b, CONFIG.cameraDistance, fov, cx, cy + bob);
        const pc = project(f.c, CONFIG.cameraDistance, fov, cx, cy + bob);
        // Dark metal that only picks up gold where the key light lands, so the
        // surface reads as brushed metal rather than as a glowing solid.
        const warmth = Math.pow(light, 1.9);
        ctx.fillStyle = `rgba(${GOLD}, ${0.05 + warmth * 0.30})`;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.lineTo(pc.x, pc.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(${GOLD_LIGHT}, ${warmth * 0.16})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // --- Wireframe lattice ---------------------------------------------
      const projectedLattice = lattice.vertices.map((v) => toScreen(v));

      for (const e of lattice.edges) {
        const from = projectedLattice[e.a];
        const to = projectedLattice[e.b];
        const depth = (from.p.depth + to.p.depth) / 2;
        const alpha = mapRange(
          depth,
          CONFIG.cameraDistance + CONFIG.latticeRadius,
          CONFIG.cameraDistance - CONFIG.latticeRadius,
          0.04,
          0.30
        );
        ctx.strokeStyle = `rgba(${GOLD}, ${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(from.p.x, from.p.y);
        ctx.lineTo(to.p.x, to.p.y);
        ctx.stroke();
      }

      // Lattice nodes. Radius scales with the perspective divisor, so near
      // nodes are genuinely larger rather than merely brighter.
      for (const item of projectedLattice) {
        const depth = item.p.depth;
        const alpha = mapRange(
          depth,
          CONFIG.cameraDistance + CONFIG.latticeRadius,
          CONFIG.cameraDistance - CONFIG.latticeRadius,
          0.10,
          0.85
        );
        const radius = Math.max(0.6, item.p.scale * 0.006);
        ctx.fillStyle = `rgba(${GOLD_LIGHT}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(item.p.x, item.p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Orbiting motes -------------------------------------------------
      // Each mote rides its own slow orbit, offset by index so they never
      // parade in lockstep.
      for (let i = 0; i < motes.length; i += 1) {
        const base = motes[i];
        const phase = elapsed * 0.22 + i * 1.7;
        const wobble = Math.sin(phase) * 0.12;
        const orbited = rotateYX(base, phase * 0.35, wobble);
        const { p } = toScreen(orbited);
        const alpha = mapRange(
          p.depth,
          CONFIG.cameraDistance + 2.4,
          CONFIG.cameraDistance - 2.4,
          0.05,
          0.7
        );
        const radius = Math.max(0.7, p.scale * 0.0075);
        const colour = i % 3 === 0 ? CYAN : i % 3 === 1 ? VIOLET : GOLD_LIGHT;
        ctx.fillStyle = `rgba(${colour}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = (time: number) => {
      draw(time);
      frame = window.requestAnimationFrame(loop);
    };

    resize();
    onScroll();

    if (reduced) {
      // One static frame: the composition still reads, nothing animates.
      draw(0);
    } else {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave);
      window.addEventListener('scroll', onScroll, { passive: true });
      sync();
    }

    window.addEventListener('resize', resize);

    // Pause when the tab is hidden. rAF is already throttled in a background
    // tab, but stopping outright means a phone with the page backgrounded is
    // doing no canvas work at all.
    const onVisibility = () => {
      tabVisible = document.visibilityState === 'visible';
      sync();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Pause once the hero scrolls away. This is the change that matters most
    // for battery: without it the core keeps rendering the entire time someone
    // reads the rest of the page, entirely off-screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      // The canvas is decoration layered under the headline. Without this it
      // would swallow pointer events meant for the text and buttons above it.
      style={{ pointerEvents: 'none' }}
    />
  );
}

export default HeroCore;
