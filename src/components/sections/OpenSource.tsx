'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, GitFork, Github } from 'lucide-react';
import { repositories, socialLinks } from '@/lib/data';
import type { Repository } from '@/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Badge } from '@/components/ui/Badge';
import { cn, originLabels } from '@/lib/utils';
import { staggerContainer, staggerItem, viewportOnce } from '@/lib/animations';

/**
 * Open Source & Experiments — real public repositories.
 *
 * The section returns `null` when `repositories` is empty, so an unfilled data
 * layer produces no section at all rather than a "coming soon" promise.
 *
 * Names and URLs are the confirmed part. Descriptions, languages, and provenance
 * may still be `null`/`unverified` in the data, and the cards render that state
 * explicitly instead of guessing — see the note in `data.ts` for why
 * classification in particular is left blank rather than inferred.
 */
export function OpenSource() {
  if (repositories.length === 0) return null;

  // Read the profile URL from the single place it is already defined, rather
  // than repeating the literal here where it could drift out of sync.
  const githubProfile = socialLinks.find((s) => s.label === 'GitHub')?.href;

  // Drives the section description. While anything is still unclassified the
  // copy has to say so — claiming every entry is labelled would be false, and
  // this is the one section whose entire value rests on its labels being true.
  const hasPending = repositories.some((r) => r.origin === 'unverified');

  return (
    <section id="open-source" className="relative py-24 sm:py-32">
      <div className="container-px relative">
        <SectionHeading
          align="left"
          eyebrow="Open source"
          title="Repositories &"
          highlight="experiments"
          description={
            hasPending
              ? 'Public repositories from my GitHub. Some are original work and some are forks — each card links straight to the repo, and anything not yet confirmed is marked rather than claimed.'
              : 'Public code, straight from GitHub. Each entry says what it is — original work, a fork, or an experiment — so nothing here reads as more than it is.'
          }
        />

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-14 grid gap-4 md:grid-cols-2"
        >
          {repositories.map((repo) => (
            <motion.li key={repo.url} variants={staggerItem}>
              <RepoCard repo={repo} />
            </motion.li>
          ))}
        </motion.ul>

        {githubProfile && (
          <div className="mt-10 flex justify-center">
            <a
              href={githubProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm text-ink-muted transition-colors duration-300 hover:border-gold/40 hover:text-gold"
            >
              <Github className="h-4 w-4" aria-hidden />
              All repositories on GitHub
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * A single repository. The whole card is one anchor to the exact repo URL —
 * `Repository.url` is required by the type, so there is no unlinked variant to
 * handle here the way there is on project cards.
 *
 * Null fields render as an explicit pending marker rather than being hidden. A
 * hidden gap reads as "this repo has no description"; a visible one reads as
 * "this has not been filled in yet", which is what is actually true.
 */
function RepoCard({ repo }: { repo: Repository }) {
  const isFork = repo.origin === 'fork';
  const isPending = repo.origin === 'unverified';

  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-2xl glass p-6 transition-colors duration-500 hover:border-gold/35"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex items-center gap-1.5 font-mono text-base font-semibold text-white transition-colors duration-300 group-hover:text-gold">
          {isFork && <GitFork className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />}
          {repo.name}
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-ink-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
            aria-hidden
          />
          <span className="sr-only">(opens in a new tab)</span>
        </h3>
      </div>

      {repo.description ? (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
          {repo.description}
        </p>
      ) : (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-faint">
          Details pending verification.
        </p>
      )}

      {/*
        A fork names its upstream. Listing derived work without crediting where
        it came from is the single most misleading thing this section could do,
        so the type makes `upstream` mandatory and it is rendered unconditionally.
      */}
      {isFork && (
        <p className="mt-2 text-xs text-ink-faint">
          Forked from <span className="font-mono">{repo.upstream}</span>
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {repo.language && <Badge>{repo.language}</Badge>}
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider',
            isFork || isPending
              ? 'border-white/15 bg-white/5 text-ink-muted'
              : 'border-gold/30 bg-gold/10 text-gold'
          )}
        >
          {originLabels[repo.origin]}
        </span>
        {repo.status && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            {repo.status}
          </span>
        )}
      </div>
    </a>
  );
}
