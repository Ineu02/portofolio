import type { Variants } from 'framer-motion';

/**
 * Reusable Framer Motion variants shared across sections.
 * Keeping them centralized ensures consistent motion language sitewide.
 */

// Standard easing curve inspired by Apple/Linear-style motion.
export const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * How far reveals travel, in pixels.
 *
 * These were 24–28px. The distance is what sets how long a reveal has to run to
 * feel eased rather than abrupt, so shortening it is what let the durations below
 * come down without the motion turning into a snap. At 14px the movement still
 * reads as arrival; past about 30px it starts to read as the page assembling
 * itself, which is the feeling being removed here.
 */
const RISE = 14;

/**
 * Reveals start a hair above zero rather than at zero.
 *
 * Framer serialises a variant's `hidden` state into the server-rendered markup as
 * an inline style, so every element using these variants ships with its start
 * value baked into the HTML — around a hundred of them on the home page, the
 * `<h1>` included.
 *
 * To be clear about what this constant does and does not buy: 0.001 is not
 * legible, so it does *not* rescue a visitor whose JS failed. That case is
 * handled by the `<noscript>` override in `app/layout.tsx`, which is the only
 * thing that actually makes the page readable without scripting. What this does
 * is keep the markup out of the `opacity:0` pattern that some text-extraction and
 * indexing heuristics treat as deliberately hidden text, at no visual or
 * compositing cost. The genuine fix for a slow hydration is the shortened delays
 * below, not this value.
 */
const HIDDEN_OPACITY = 0.001;

export const fadeUp: Variants = {
  hidden: { opacity: HIDDEN_OPACITY, y: RISE },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: HIDDEN_OPACITY },
  visible: { opacity: 1, transition: { duration: 0.5, ease: easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: HIDDEN_OPACITY, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.42, ease: easeOut },
  },
};

/**
 * Container that staggers its children for a cascading reveal.
 *
 * The stagger is the setting that most decides whether a section feels quick or
 * ceremonial, because it multiplies: at the old 0.1s a six-card grid took 0.5s
 * before its last card even began to move, and the sections here run up to six
 * children. At 0.05s the cascade is still legible as a cascade — the eye reads
 * order, not simultaneity — and the last child starts 0.25s in instead.
 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: HIDDEN_OPACITY, y: RISE },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: easeOut },
  },
};

/**
 * Standard viewport config so animations fire once.
 *
 * `margin` is a `rootMargin`, and a *negative* one shrinks the box a reveal has
 * to reach — so it makes reveals fire later, once the element is that many pixels
 * inside the viewport, not earlier. Reducing the magnitude is therefore what
 * brings the motion forward. This was -80px; at -40px a section starts revealing
 * sooner after it appears, which is the direction that makes scrolling feel
 * responsive rather than trailing.
 *
 * Worth not overshooting in the other direction either: a large negative margin
 * carves a dead zone out of the bottom of the viewport, and anything that ends up
 * inside it at maximum scroll — the tail of the last section — would never reveal
 * at all, because there is no further scrolling left to push it clear.
 */
export const viewportOnce = { once: true, margin: '-40px' } as const;
