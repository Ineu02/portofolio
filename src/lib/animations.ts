import type { Variants } from 'framer-motion';

/**
 * Reusable Framer Motion variants shared across sections.
 * Keeping them centralized ensures consistent motion language sitewide.
 */

// Standard easing curve inspired by Apple/Linear-style motion.
export const easeOut = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: easeOut } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easeOut },
  },
};

/** Container that staggers its children for a cascading reveal. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
};

/** Standard viewport config so animations fire once, slightly early. */
export const viewportOnce = { once: true, margin: '-80px' } as const;
