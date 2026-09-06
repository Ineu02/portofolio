'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  damp,
  faceNormal,
  fibonacciSphere,
  icosphere,
  mapRange,
  projectInto,
  ring,
  rotateYX,
  shade,
  type Light,
  type Mesh,
  type Projected,
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
  /** Shortest gap between frames, in ms. 0 follows the display. */
  minFrameMs: number;
}

/**
 * Quality tiers by viewport width.
 *
 * Mobile gets a genuinely lighter scene rather than the same scene scaled
 * down: fewer subdivisions, fewer motes, a lower resolution, and half the frame
 * rate. Fill rate, not vertex count, is what costs on a phone, so the DPR cap
 * matters more than any of the geometry reductions — at 1.5 instead of 2 device
 * pixels per CSS pixel there are 44% fewer pixels to shade every frame, and the
 * object is a masked, 70%-opacity decoration behind the headline, which is the
 * last place on the page where hairline sharpness is worth paying for.
 *
 * The frame cap is safe here because nothing in the scene moves quickly: the
 * ambient yaw is 0.16 rad/s and the pointer lean, the one fast response, does
 * not exist on a touch device at all.
 */
function qualityFor(width: number): Quality {
  if (width < 640)
    return { detail: 1, motes: 14, ringSegments: 48, maxDpr: 1.5, minFrameMs: 32 };
  if (width < 1024)
    return { detail: 1, motes: 20, ringSegments: 64, maxDpr: 2, minFrameMs: 0 };
  return { detail: 2, motes: 26, ringSegments: 90, maxDpr: 2, minFrameMs: 0 };
}

/* -------------------------------------------------------------------- */
/* Colour ramps                                                          */
/* -------------------------------------------------------------------- */

/**
 * Number of alpha levels each colour is quantised to.
 *
 * Canvas 2D charges per draw call, and every change of `strokeStyle` or
 * `fillStyle` costs a string allocation plus a CSS colour parse. The scene used
 * to build a fresh `rgba(...)` string and issue its own `stroke()` or `fill()`
 * for each of roughly a thousand primitives per frame — sixty thousand parses a
 * second — when nearly all of them differed only by an alpha step no eye can
 * resolve. Rounding alpha to one of these levels lets every primitive sharing a
 * level share one path and one draw call, with the strings built once at module
 * load.
 *
 * Sixteen steps over the widest range in use (0.10–0.85) is a step of 0.047 on
 * a hairline against a near-black page. The visible cost is nil; the saving is
 * two orders of magnitude of draw calls.
 */
const STEPS = 16;

/** One full turn, hoisted out of the per-node arc calls. */
const TAU = Math.PI * 2;

/** Pre-built `rgba()` strings for one colour across `lo`..`hi` alpha. */
function ramp(colour: string, lo: number, hi: number): string[] {
  return Array.from(
    { length: STEPS },
    (_, i) => `rgba(${colour}, ${(lo + ((i + 0.5) / STEPS) * (hi - lo)).toFixed(3)})`
  );
}

/** Bucket a 0..1 factor into a ramp index. */
function step(t: number): number {
  return t <= 0 ? 0 : t >= 1 ? STEPS - 1 : (t * STEPS) | 0;
}

/** Line widths for ring segments, quantised alongside their alpha. */
const RING_WIDTH = Array.from({ length: STEPS }, (_, i) => 0.5 + ((i + 0.5) / STEPS) * 0.9);

const RING_A_COLOUR = ramp(GOLD, 0.62 * 0.12, 0.62);
const RING_B_COLOUR = ramp(VIOLET, 0.5 * 0.12, 0.5);
const CORE_FILL = ramp(GOLD, 0.05, 0.35);
const CORE_EDGE = ramp(GOLD_LIGHT, 0, 0.16);
const LATTICE_EDGE = ramp(GOLD, 0.04, 0.3);
const LATTICE_NODE = ramp(GOLD_LIGHT, 0.1, 0.85);
const MOTE_COLOUR = [ramp(CYAN, 0.05, 0.7), ramp(VIOLET, 0.05, 0.7), ramp(GOLD_LIGHT, 0.05, 0.7)];

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

    // Scratch space, rewritten in place every frame rather than reallocated.
    // Projecting into fresh objects meant several hundred short-lived
    // allocations per frame, tens of thousands a second, which is enough
    // garbage to turn into periodic collection pauses on a phone.
    const blank = (): Projected => ({ x: 0, y: 0, depth: 0, scale: 0 });
    let projectedLattice: Projected[] = lattice.vertices.map(blank);
    let projectedRingA: Projected[] = ringA.map(blank);
    let projectedRingB: Projected[] = ringB.map(blank);
    const scratch: Projected[] = [blank(), blank(), blank()];

    // Flat coordinate lists, one per alpha level, refilled each frame. Every
    // primitive that lands in the same level is drawn by a single path and a
    // single canvas call — see the note on STEPS above.
    const makeBuckets = () => Array.from({ length: STEPS }, (): number[] => []);
    const segBuckets = makeBuckets();
    const coreBuckets = makeBuckets();
    const edgeBuckets = makeBuckets();
    const nodeBuckets = makeBuckets();
    const clear = (buckets: number[][]) => {
      // Truncating keeps the backing capacity, so after the first few frames
      // the refill does not allocate either.
      for (const bucket of buckets) bucket.length = 0;
    };

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

      // Tier first, then the DPR it implies. Reading the cap before updating
      // the tier would size the backing store from the width we just left,
      // which on a phone rotated to landscape meant the mobile cap survived
      // into the desktop scene for a frame.
      const nextQuality = qualityFor(window.innerWidth);
      const rebuild =
        nextQuality.detail !== quality.detail || nextQuality.motes !== quality.motes;
      quality = nextQuality;

      // Rebuild geometry if the breakpoint changed — rotating a phone should
      // get the tier appropriate to the new width, not keep the old one.
      if (rebuild) {
        lattice = icosphere(CONFIG.latticeRadius, quality.detail);
        core = icosphere(CONFIG.coreRadius, 1);
        motes = fibonacciSphere(quality.motes, CONFIG.latticeRadius * 1.5);
        ringA = ring(CONFIG.latticeRadius * 1.75, quality.ringSegments, 0.42);
        ringB = ring(CONFIG.latticeRadius * 2.05, quality.ringSegments, -0.72);
        projectedLattice = lattice.vertices.map(blank);
        projectedRingA = ringA.map(blank);
        projectedRingB = ringB.map(blank);
      }

      const dpr = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Reset before scaling: setTransform is absolute, so repeated resizes
      // cannot compound the DPR scale the way a bare scale() call would.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
     * Everything is composited additively, so unlike a conventional painter's
     * algorithm the order primitives are submitted in has no effect on the
     * result — addition commutes. That is what licenses the batching below:
     * primitives are grouped by how bright they are rather than by how far away
     * they are, and each group is drawn by one path and one canvas call. The
     * pass-behind illusion survives because it was never coming from the paint
     * order; it comes from depth-dimming each primitive individually, which
     * still happens.
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
      const originY = cy + bob;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      const toScreen = (v: Vec3, out: Projected) =>
        projectInto(rotateYX(v, yaw, pitch), CONFIG.cameraDistance, fov, cx, originY, out);

      // --- Orbital rings -------------------------------------------------
      // Each point is projected once and used by the two segments that meet
      // there; the previous version projected both endpoints of every segment,
      // doing the whole ring's worth of trigonometry twice.
      const drawRing = (points: Vec3[], projected: Projected[], colours: string[]) => {
        for (let i = 0; i < points.length; i += 1) toScreen(points[i], projected[i]);
        clear(segBuckets);

        for (let i = 0; i < projected.length; i += 1) {
          const from = projected[i];
          const to = projected[(i + 1) % projected.length];
          const depth = (from.depth + to.depth) / 2;
          const level = step(
            mapRange(depth, CONFIG.cameraDistance + 2, CONFIG.cameraDistance - 2, 0, 1)
          );
          segBuckets[level].push(from.x, from.y, to.x, to.y);
        }

        for (let level = 0; level < STEPS; level += 1) {
          const seg = segBuckets[level];
          if (seg.length === 0) continue;
          ctx.strokeStyle = colours[level];
          ctx.lineWidth = RING_WIDTH[level];
          ctx.beginPath();
          for (let i = 0; i < seg.length; i += 4) {
            ctx.moveTo(seg[i], seg[i + 1]);
            ctx.lineTo(seg[i + 2], seg[i + 3]);
          }
          ctx.stroke();
        }
      };

      drawRing(ringB, projectedRingB, RING_B_COLOUR);
      drawRing(ringA, projectedRingA, RING_A_COLOUR);

      // --- Solid core ----------------------------------------------------
      // Back-face culled. Culling roughly halves the fill work and, more
      // importantly, stops rear faces from lightening front ones through the
      // additive blend. The depth sort the previous version did before painting
      // has been dropped: with `lighter` the accumulated result is the same
      // whatever order the faces arrive in, so it was eighty comparisons a
      // frame buying nothing.
      clear(coreBuckets);

      for (const f of core.faces) {
        const a = rotateYX(core.vertices[f.a], yaw, pitch);
        const b = rotateYX(core.vertices[f.b], yaw, pitch);
        const c = rotateYX(core.vertices[f.c], yaw, pitch);
        const normal = faceNormal(a, b, c);
        if (normal[2] <= -0.05) continue;

        // Dark metal that only picks up gold where the key light lands, so the
        // surface reads as brushed metal rather than as a glowing solid.
        const warmth = Math.pow(shade(normal, KEY_LIGHT, FILL_LIGHT), 1.9);
        const pa = projectInto(a, CONFIG.cameraDistance, fov, cx, originY, scratch[0]);
        const pb = projectInto(b, CONFIG.cameraDistance, fov, cx, originY, scratch[1]);
        const pc = projectInto(c, CONFIG.cameraDistance, fov, cx, originY, scratch[2]);
        coreBuckets[step(warmth)].push(pa.x, pa.y, pb.x, pb.y, pc.x, pc.y);
      }

      ctx.lineWidth = 0.6;
      for (let level = 0; level < STEPS; level += 1) {
        const tri = coreBuckets[level];
        if (tri.length === 0) continue;
        ctx.beginPath();
        for (let i = 0; i < tri.length; i += 6) {
          ctx.moveTo(tri[i], tri[i + 1]);
          ctx.lineTo(tri[i + 2], tri[i + 3]);
          ctx.lineTo(tri[i + 4], tri[i + 5]);
          ctx.closePath();
        }
        ctx.fillStyle = CORE_FILL[level];
        ctx.fill();
        ctx.strokeStyle = CORE_EDGE[level];
        ctx.stroke();
      }

      // --- Wireframe lattice ---------------------------------------------
      for (let i = 0; i < lattice.vertices.length; i += 1) {
        toScreen(lattice.vertices[i], projectedLattice[i]);
      }

      const latticeFar = CONFIG.cameraDistance + CONFIG.latticeRadius;
      const latticeNear = CONFIG.cameraDistance - CONFIG.latticeRadius;

      clear(edgeBuckets);
      for (const e of lattice.edges) {
        const from = projectedLattice[e.a];
        const to = projectedLattice[e.b];
        const depth = (from.depth + to.depth) / 2;
        const level = step(mapRange(depth, latticeFar, latticeNear, 0, 1));
        edgeBuckets[level].push(from.x, from.y, to.x, to.y);
      }

      ctx.lineWidth = 0.7;
      for (let level = 0; level < STEPS; level += 1) {
        const seg = edgeBuckets[level];
        if (seg.length === 0) continue;
        ctx.strokeStyle = LATTICE_EDGE[level];
        ctx.beginPath();
        for (let i = 0; i < seg.length; i += 4) {
          ctx.moveTo(seg[i], seg[i + 1]);
          ctx.lineTo(seg[i + 2], seg[i + 3]);
        }
        ctx.stroke();
      }

      // Lattice nodes. Radius scales with the perspective divisor, so near
      // nodes are genuinely larger rather than merely brighter.
      clear(nodeBuckets);
      for (const p of projectedLattice) {
        const level = step(mapRange(p.depth, latticeFar, latticeNear, 0, 1));
        nodeBuckets[level].push(p.x, p.y, Math.max(0.6, p.scale * 0.006));
      }

      for (let level = 0; level < STEPS; level += 1) {
        const dot = nodeBuckets[level];
        if (dot.length === 0) continue;
        ctx.fillStyle = LATTICE_NODE[level];
        ctx.beginPath();
        for (let i = 0; i < dot.length; i += 3) {
          const radius = dot[i + 2];
          // Move to the circle's own start point first: without this the arcs
          // would be joined by straight lines and filled as one blob.
          ctx.moveTo(dot[i] + radius, dot[i + 1]);
          ctx.arc(dot[i], dot[i + 1], radius, 0, TAU);
        }
        ctx.fill();
      }

      // --- Orbiting motes -------------------------------------------------
      // Each mote rides its own slow orbit, offset by index so they never
      // parade in lockstep. Left unbatched: there are only a dozen or two, and
      // the three colours would need three sets of buckets to group.
      for (let i = 0; i < motes.length; i += 1) {
        const phase = elapsed * 0.22 + i * 1.7;
        const wobble = Math.sin(phase) * 0.12;
        const p = toScreen(rotateYX(motes[i], phase * 0.35, wobble), scratch[0]);
        const level = step(
          mapRange(p.depth, CONFIG.cameraDistance + 2.4, CONFIG.cameraDistance - 2.4, 0, 1)
        );
        const radius = Math.max(0.7, p.scale * 0.0075);
        ctx.fillStyle = MOTE_COLOUR[i % 3][level];
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, TAU);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    };

    const loop = (time: number) => {
      frame = window.requestAnimationFrame(loop);
      // Frame cap for the small-screen tier. Skipping the draw rather than the
      // callback keeps scheduling aligned with the display, so the frames that
      // do render still land on a vsync boundary instead of drifting across it.
      if (quality.minFrameMs > 0 && time - lastTime < quality.minFrameMs) return;
      draw(time);
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
