'use client';

import { motion } from 'framer-motion';
import { techGroups } from '@/lib/data';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Tilt3D } from '@/components/ui/Tilt3D';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, viewportOnce } from '@/lib/animations';

/**
 * Depth planes for the technology wall, cycled by index.
 *
 * Fixed rather than random: a random Z per badge would change on every render,
 * so the wall would shimmer instead of sitting still. Cycling gives an uneven,
 * hand-placed look that is nonetheless stable across renders.
 */
const TECH_DEPTHS = [
  'group-hover:[transform:translateZ(30px)]',
  'group-hover:[transform:translateZ(14px)]',
  'group-hover:[transform:translateZ(38px)]',
  'group-hover:[transform:translateZ(22px)]',
] as const;

/**
 * Tech Stack section — six semantic groups rendered as an interactive
 * technology wall. Each card tilts toward the cursor and its badges sit on
 * staggered Z planes, so the group has real depth rather than being a flat
 * sheet of pills. Every badge is a real link to that technology's official
 * documentation.
 */
export function TechStack() {
  return (
    <section id="stack" className="relative py-24 sm:py-32">
      <div className="container-px relative">
        <SectionHeading
          eyebrow="Tech stack"
          title="Technologies &"
          highlight="expertise"
          description="Grouped by layer — from the languages and frontend through to AI models and the chains they work with."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {techGroups.map((group) => (
            <motion.div key={group.category} variants={staggerItem} className="h-full">
              <Tilt3D className="h-full" maxTilt={7} lift={14}>
              <GlassCard
                className="group relative h-full overflow-hidden p-8"
              >
                {/* Hover glow */}
                <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-gold/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                <h3 className="relative font-display text-xl font-semibold text-white transition-all duration-500 [transform:translateZ(0px)] group-hover:text-gold group-hover:[transform:translateZ(26px)]">
                  {group.category}
                </h3>

                {/*
                  The technology wall. Each badge sits on its own Z plane so the
                  group parallaxes as the card turns, giving the wall real depth
                  instead of a flat sheet of pills.

                  The offsets cycle over four values rather than being random:
                  a random depth per badge would reshuffle on every render and
                  make the wall shimmer. Nothing rotates continuously — these
                  are labels, and a label you cannot read is decoration.
                */}
                <div className="relative mt-6 flex flex-wrap gap-2 [transform-style:preserve-3d]">
                  {group.items.map((tech, i) => (
                    <a
                      key={tech.name}
                      href={tech.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'rounded-full transition-transform duration-500 ease-out hover:-translate-y-0.5',
                        TECH_DEPTHS[i % TECH_DEPTHS.length]
                      )}
                      aria-label={`${tech.name} documentation (opens in a new tab)`}
                    >
                      <Badge className="transition-colors duration-300 hover:border-gold/40 hover:text-gold">
                        {tech.name}
                      </Badge>
                    </a>
                  ))}
                </div>
              </GlassCard>
              </Tilt3D>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
