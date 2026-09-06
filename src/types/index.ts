/**
 * Global TypeScript type definitions for the portfolio.
 * Centralizing shared shapes keeps data files and components in sync.
 */

import type { LucideIcon } from 'lucide-react';

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  /**
   * Render the value literally instead of animating a count-up. Needed for
   * values that are not quantities — a year would otherwise count up from zero
   * and display with a thousands separator ("2,022").
   */
  literal?: boolean;
}

/**
 * Hero statistic. `display` holds the literal string shown (e.g. "24/7"),
 * so non-numeric values render correctly without a counter animation.
 */
export interface HeroStat {
  label: string;
  display: string;
  /** Numeric portion for the count-up animation; omit for literal values. */
  value?: number;
  suffix?: string;
}

/** A grouped set of technologies, rendered as one premium card. */
export interface TechGroup {
  category: string;
  items: TechEntry[];
}

/** A single milestone on the animated timeline. */
export interface TimelineEntry {
  year: string;
  title: string;
  description: string;
  /**
   * How this milestone came about — "Self-taught", "Independent research", and
   * so on. Rendered as a small label so the timeline cannot be misread as an
   * employment history.
   */
  kind: string;
}

export interface Skill {
  name: string;
  level: number; // 0 - 100
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
  achievements: string[];
}

export type ProjectCategory =
  | 'All'
  | 'AI Agents'
  | 'Infrastructure'
  | 'Security'
  | 'Analytics';

/**
 * Publication state of a project. This drives which actions the card offers,
 * so it must describe reality rather than ambition:
 *   - `LIVE`        — publicly deployed and reachable right now
 *   - `OPEN SOURCE` — public repository available
 *   - `RESEARCH`    — ongoing research, no public artifact
 *   - `PROTOTYPE`   — working but not production, not published
 *   - `PRIVATE`     — built, but source and deployment stay closed
 *   - `COMING SOON` — announced, nothing public yet
 */
export type ProjectStatus =
  | 'LIVE'
  | 'OPEN SOURCE'
  | 'RESEARCH'
  | 'PROTOTYPE'
  | 'PRIVATE'
  | 'COMING SOON';

/**
 * Provenance of a piece of work. Deliberately separate from `ProjectStatus`:
 * status answers "can the public reach it?", origin answers "whose work is it?".
 * Those are independent — a fork can be public and a private project can be
 * entirely original — and collapsing them into one badge is how a fork ends up
 * presented as original work.
 *
 *   - `original`   — written from scratch by the author
 *   - `open-source`— published under an open licence for others to use
 *   - `research`   — exploratory work or proof of concept, not a product
 *   - `fork`       — derived from someone else's project, or a contribution to it
 *   - `private`    — original work whose source stays closed
 *
 * `fork` exists so a forked or template-derived repository can never be listed
 * without saying so.
 */
export type ProjectOrigin =
  | 'original'
  | 'open-source'
  | 'research'
  | 'fork'
  | 'private';

/**
 * Provenance of a repository, including the state the others do not have: not
 * yet established.
 *
 * `unverified` exists because a repository can be added from its name alone —
 * the name is a fact, but whether it is original work or a fork is not derivable
 * from it. Without this value the only way to add such a repo would be to pick a
 * classification, and the wrong pick presents a fork as original work. Entries
 * stay `unverified` until someone actually opens the repo and confirms.
 */
export type RepositoryOrigin = ProjectOrigin | 'unverified';

/**
 * A public repository shown in the "Open Source & Experiments" section.
 *
 * `name` and `url` are required because they are the two things always known.
 * Everything else is nullable, and null means "not yet confirmed" rather than
 * "none" — the UI renders a pending marker instead of hiding the gap, so an
 * unfilled entry reads as incomplete rather than as a repo with no description.
 *
 * `upstream` remains mandatory whenever `origin` is `fork`, so a fork still
 * cannot be listed without naming what it was forked from.
 */
export type Repository = {
  name: string;
  /** Exact repository URL — never a profile root, never a guessed slug. */
  url: string;
  /** The repo's own GitHub description, or null until copied across. */
  description: string | null;
  /** GitHub's reported primary language, or null while unconfirmed. */
  language: string | null;
  /** Publication state, or null while unconfirmed. */
  status: ProjectStatus | null;
} & (
  | { origin: Exclude<RepositoryOrigin, 'fork'>; upstream?: never }
  | { origin: 'fork'; upstream: string }
);

/**
 * A single case-study section. Kept as a free-form heading/body pair so a
 * project can describe only what it actually has, instead of padding a fixed
 * template with empty sections.
 */
export interface CaseStudySection {
  heading: string;
  body: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  /** Describes what the cover art is, so artwork is never mistaken for a screenshot. */
  imageKind: 'concept' | 'screenshot';
  imageAlt: string;
  category: Exclude<ProjectCategory, 'All'>;
  status: ProjectStatus;
  /**
   * Provenance of the work. Rendered next to the status badge so a reader can
   * tell original work from a fork without opening the repository.
   */
  origin: ProjectOrigin;
  /** Short, honest explanation of the status, shown beneath the badge. */
  statusNote: string;
  tech: string[];
  /**
   * Real repository URL, or `null` when no public repo exists. `null` hides the
   * Code button entirely — never point this at a profile root to fill the gap.
   */
  github: string | null;
  /** Real deployment URL, or `null` when nothing is publicly deployed. */
  demo: string | null;
  /** Internal case-study route. Always present, so every card has one real action. */
  caseStudy: string;
  /**
   * True only once the `github`/`demo` destinations have been opened and
   * confirmed to resolve. Left `false` until then — it gates the "Verified"
   * marker, so an unchecked link must never claim to be verified.
   */
  verified: boolean;
  featured?: boolean;
}

/**
 * The long-form half of a project, stored apart from the card fields above.
 *
 * The split is a payload decision, not a modelling one: the project grid is a
 * client component, so every byte of `Project` is compiled into the browser
 * bundle for anyone who loads the home page. These fields are read only by the
 * case-study route, which renders on the server — see `src/lib/project-details.ts`.
 */
export interface ProjectDetail {
  overview: string;
  problem: string;
  solution: string;
  architecture: string;
  features: string[];
  /** What exists publicly today, stated plainly. */
  currentStatus: string;
}

/** A project with its case-study prose attached, as the detail route builds it. */
export type ProjectWithDetail = Project & ProjectDetail;

export interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

/**
 * A publicly checkable piece of evidence. Every proof item must resolve to a
 * real destination — this section exists to be verified by a stranger, so a
 * broken or aspirational link defeats its entire purpose.
 */
export interface ProofItem {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

/** A technology name paired with its official documentation URL. */
export interface TechEntry {
  name: string;
  href: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
  /** True for illustrative sample testimonials, which are labelled in the UI. */
  sample?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  category: string;
  /**
   * True only when the article actually exists and `href` points at it. While
   * false the card renders unlinked with a "Publishing soon" tag — no date, no
   * reading time, and no link, since none of those are real for unwritten text.
   */
  published: boolean;
  /** Canonical URL of the published article. Required when `published` is true. */
  href?: string;
  /** Publication date, e.g. "Jul 28, 2026". Only set once published. */
  date?: string;
  /** Estimated reading time. Only set once published. */
  readTime?: string;
}
