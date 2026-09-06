'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import type { ProjectStatus, ProjectWithDetail } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn, originLabels } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from '@/lib/animations';

/** Mirrors the status treatment on the project cards. */
const STATUS_STYLES: Record<ProjectStatus, string> = {
  LIVE: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  'OPEN SOURCE': 'border-gold/40 bg-gold/10 text-gold',
  RESEARCH: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  PROTOTYPE: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  PRIVATE: 'border-white/15 bg-white/5 text-ink-muted',
  'COMING SOON': 'border-white/15 bg-white/5 text-ink-muted',
};

/**
 * Long-form case study for a single project.
 *
 * The narrative sections describe design decisions and trade-offs — the parts
 * that are true of the work regardless of whether it shipped. There are
 * deliberately no metrics: no users, revenue, transaction volume, audit
 * findings, or benchmarks, because none of those are measurable from what
 * exists, and inventing them is exactly what this page is meant to avoid.
 */
export function CaseStudy({ project }: { project: ProjectWithDetail }) {
  const reduced = useReducedMotion();

  const sections = [
    { heading: 'Overview', body: project.overview },
    { heading: 'Problem', body: project.problem },
    { heading: 'Solution', body: project.solution },
    { heading: 'Architecture', body: project.architecture },
  ];

  const hasLinks = Boolean(project.github || project.demo);

  return (
    <article className="relative pb-24 pt-32 sm:pt-36">
      <div className="bg-gold-radial absolute inset-x-0 top-0 h-96 opacity-30" aria-hidden />

      <div className="container-px relative mx-auto max-w-4xl">
        {/* Back to the grid */}
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors duration-300 hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All projects
        </Link>

        {/* Header */}
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider',
                STATUS_STYLES[project.status]
              )}
            >
              {project.status}
            </span>
            <span className="text-sm text-ink-faint">{project.statusNote}</span>
            {/* Provenance, matching the treatment on the project card. */}
            <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              {originLabels[project.origin]}
            </span>
            <Badge>{project.category}</Badge>
          </div>

          <h1 className="mt-5 font-display text-display-sm font-bold text-white">
            {project.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            {project.description}
          </p>
        </motion.header>

        {/* Cover art, labelled for what it is */}
        <motion.figure
          initial={reduced ? undefined : { opacity: 0.001, y: 14 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-10 overflow-hidden rounded-2xl border border-white/10"
        >
          <div className="relative aspect-[16/9]">
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
          <figcaption className="border-t border-white/10 bg-white/[0.02] px-5 py-3 text-xs text-ink-faint">
            {project.imageKind === 'concept'
              ? 'Concept artwork illustrating the architecture. Not a screenshot of a running interface.'
              : 'Screenshot of the running application.'}
          </figcaption>
        </motion.figure>

        {/* Narrative */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-14 space-y-12"
        >
          {sections.map((section) => (
            <motion.section key={section.heading} variants={staggerItem}>
              <h2 className="font-display text-2xl font-semibold text-white">
                {section.heading}
              </h2>
              <p className="mt-3 leading-relaxed text-ink-muted">{section.body}</p>
            </motion.section>
          ))}

          {/* Key features */}
          <motion.section variants={staggerItem}>
            <h2 className="font-display text-2xl font-semibold text-white">
              Key features
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {project.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-ink-muted"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                    aria-hidden
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Stack */}
          <motion.section variants={staggerItem}>
            <h2 className="font-display text-2xl font-semibold text-white">
              Technology stack
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
            </div>
          </motion.section>

          {/* Current status — the honest bit */}
          <motion.section variants={staggerItem}>
            <h2 className="font-display text-2xl font-semibold text-white">
              Current status
            </h2>
            <GlassCard className="mt-4 p-6">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5">
                  {hasLinks ? (
                    <ShieldCheck className="h-4 w-4 text-gold" aria-hidden />
                  ) : (
                    <Lock className="h-4 w-4 text-ink-muted" aria-hidden />
                  )}
                </span>
                <p className="leading-relaxed text-ink-muted">
                  {project.currentStatus}
                </p>
              </div>
            </GlassCard>
          </motion.section>

          {/* Links, or an honest note about their absence */}
          <motion.section variants={staggerItem}>
            <h2 className="font-display text-2xl font-semibold text-white">Links</h2>

            {hasLinks ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-ink transition-colors hover:border-gold/40 hover:text-gold"
                  >
                    <Github className="h-4 w-4" aria-hidden />
                    Source code
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-5 py-2.5 text-sm text-gold transition-colors hover:bg-gold/20"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Live deployment
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm leading-relaxed text-ink-muted">
                No public repository or deployment for this project yet, so there
                is nothing to link here. I would rather leave this empty than
                point at something that does not exist — happy to talk through
                the work directly.{' '}
                <Link
                  href="/#contact"
                  className="text-gold underline-offset-4 hover:underline"
                >
                  Get in touch
                </Link>
                .
              </p>
            )}
          </motion.section>
        </motion.div>
      </div>
    </article>
  );
}
