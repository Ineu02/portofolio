'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ExternalLink, Star, FileText } from 'lucide-react';
import { projects } from '@/lib/data';
import type { Project, ProjectCategory, ProjectStatus } from '@/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Tilt3D } from '@/components/ui/Tilt3D';
import { Badge } from '@/components/ui/Badge';
import { cn, originLabels } from '@/lib/utils';
import { viewportOnce } from '@/lib/animations';

// Build the unique list of filter categories from the data.
const categories: ProjectCategory[] = [
  'All',
  ...Array.from(new Set(projects.map((p) => p.category))),
];

/**
 * Projects section with animated category filters and a responsive grid
 * of interactive project cards. Filtering animates cards in/out with a
 * shared layout transition.
 */
export function Projects() {
  const [active, setActive] = useState<ProjectCategory>('All');

  const filtered = useMemo(
    () =>
      active === 'All'
        ? projects
        : projects.filter((p) => p.category === active),
    [active]
  );

  return (
    <section id="projects" className="relative py-24 sm:py-32">
      <div className="bg-gold-radial absolute inset-x-0 top-0 h-96 opacity-30" aria-hidden />
      <div className="container-px relative">
        <SectionHeading
          eyebrow="Selected work"
          title="Featured"
          highlight="projects"
          description="Autonomous agents, security research, and the infrastructure underneath them. Each card states what is public and what is not — several are private or still prototypes, and the status label says which."
        />

        {/* Category filters */}
        <div
          className="mt-12 flex flex-wrap justify-center gap-2"
          role="group"
          aria-label="Filter projects by category"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              aria-pressed={active === cat}
              className={cn(
                'relative rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300',
                active === cat ? 'text-background' : 'text-ink-muted hover:text-white'
              )}
            >
              {active === cat && (
                <motion.span
                  layoutId="active-filter"
                  className="absolute inset-0 rounded-full bg-gold-gradient"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>

        {/* Project grid */}
        <motion.div
          layout
          className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Colour treatment per status. Only `LIVE` and `OPEN SOURCE` get the gold
 * accent, because those are the two states where a visitor can go and see
 * something. The rest stay neutral so the badge reads as information rather
 * than decoration.
 */
const STATUS_STYLES: Record<ProjectStatus, string> = {
  LIVE: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  'OPEN SOURCE': 'border-gold/40 bg-gold/10 text-gold',
  RESEARCH: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  PROTOTYPE: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  PRIVATE: 'border-white/15 bg-white/5 text-ink-muted',
  'COMING SOON': 'border-white/15 bg-white/5 text-ink-muted',
};

/** Individual project card with image preview, 3D tilt, and actions. */
function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      viewport={viewportOnce}
      className="h-full"
    >
      {/*
        The tilt wrapper owns the perspective; the card lifts inside it. The
        angle is kept low because these cards carry dense text, and text on a
        steeply rotated plane gets hard to read well before the effect starts
        looking impressive.

        Note the card no longer sets `interactive`: that added its own hover
        lift on Y, which would fight the tilt's lift on Z for control of the
        same element.
      */}
      <Tilt3D className="h-full" maxTilt={6} lift={14}>
        <GlassCard className="group flex h-full flex-col">
          {/*
            Animated rim. It lights along the card's top edge on hover, reading
            as an edge catching the light as the card turns — quieter than a
            full animated gradient border and it costs one opacity transition.
          */}
          <span
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            aria-hidden
          />
          {/* Soft glow that blooms from behind the card on hover. */}
          <span
            className="pointer-events-none absolute -inset-px z-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(120% 80% at 50% 0%, rgba(212,175,55,0.10), transparent 60%)',
            }}
            aria-hidden
          />

          {/* Image preview */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.09]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          {project.featured && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold-gradient px-3 py-1 text-xs font-semibold text-background">
              <Star className="h-3 w-3" aria-hidden /> Featured
            </span>
          )}
          <span className="absolute right-3 top-3">
            <Badge>{project.category}</Badge>
          </span>
          {/*
            Concept artwork is labelled as such. The covers are illustrations,
            not screenshots, and an unlabelled illustration on a project card
            implies a running interface that does not exist.
          */}
          {project.imageKind === 'concept' && (
            <span className="absolute bottom-3 left-3 rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint backdrop-blur-sm">
              Concept art
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-6">
          {/* Status — what a visitor can actually expect to find */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider',
                STATUS_STYLES[project.status]
              )}
            >
              {project.status}
            </span>
            {/*
              Provenance sits beside the status because they answer different
              questions: status says whether you can reach it, origin says whose
              work it is. Kept visually quieter than the status pill so it reads
              as a qualifier rather than a second headline.
            */}
            <span className="inline-flex items-center rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              {originLabels[project.origin]}
            </span>
            <span className="text-xs text-ink-faint">{project.statusNote}</span>
          </div>

          <h3 className="font-display text-xl font-semibold text-white transition-colors group-hover:text-gold">
            {project.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
            {project.description}
          </p>

          {/* Tech badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>

          {/*
            Actions. Code and Live Demo render only when a real destination
            exists; the case study always does, so every card has at least one
            action that leads somewhere real.
          */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={project.caseStudy}
              className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-4 py-2 text-sm text-gold transition-colors hover:bg-gold/20"
              aria-label={`Read the ${project.title} case study`}
            >
              <FileText className="h-4 w-4" aria-hidden />
              Case study
            </Link>

            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-ink transition-colors hover:border-gold/40 hover:text-gold"
                aria-label={`${project.title} source code on GitHub (opens in a new tab)`}
              >
                <Github className="h-4 w-4" aria-hidden />
                Code
              </a>
            )}

            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-ink transition-colors hover:border-gold/40 hover:text-gold"
                aria-label={`${project.title} live demo (opens in a new tab)`}
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Live demo
              </a>
            )}

            {/*
              With no repo and no deployment, the row would otherwise hold a
              single button and leave a reader wondering whether the others
              failed to load. Stating the absence is clearer than an empty gap —
              and it is plain text, not a disabled button, because a disabled
              button still suggests something is meant to be clickable.
            */}
            {!project.github && !project.demo && (
              <span className="text-xs text-ink-faint">
                No public repo or demo
              </span>
            )}
          </div>
        </div>
        </GlassCard>
      </Tilt3D>
    </motion.div>
  );
}
