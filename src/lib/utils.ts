import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RepositoryOrigin } from '@/types';

/**
 * Human-readable label for each provenance value.
 *
 * Defined once, as a `Record`, so every surface that shows provenance uses the
 * same wording and adding a new origin fails the build until it is given a label
 * here. "Fork / Contribution" is spelled out rather than shortened, because that
 * is the one case a reader must not miss. "Pending verification" is deliberately
 * neutral: it must not read as a soft claim of original work.
 */
export const originLabels: Record<RepositoryOrigin, string> = {
  original: 'Original work',
  'open-source': 'Open source',
  research: 'Research / PoC',
  fork: 'Fork / Contribution',
  private: 'Private project',
  unverified: 'Pending verification',
};



/**
 * Merge Tailwind classes conditionally without style conflicts.
 * Combines clsx (conditional logic) with tailwind-merge (dedupe conflicts).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Smoothly scroll to a section by its element id, accounting for the
 * sticky navbar height so the heading isn't hidden underneath it.
 */
export function scrollToSection(id: string, offset = 80): void {
  const el = document.getElementById(id.replace('#', ''));
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

/** Validate an email address with a pragmatic RFC-lite pattern. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
