'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Briefcase, Cpu } from 'lucide-react';
import { profile, coreSkills, orbitTech, timeline, experience, stats } from '@/lib/data';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { OrbitRing } from '@/components/ui/OrbitRing';
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from '@/lib/animations';

/**
 * About section — narrative, an orbiting stack visual that echoes the hero
 * ring, an animated statistics band, the year-by-year journey, and the
 * detailed experience timeline.
 */
export function About() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="container-px">
        <SectionHeading eyebrow="Profile" title="About Me" description={profile.about} />

        {/* Narrative + orbiting stack */}
        <div className="mt-16 grid items-stretch gap-8 lg:grid-cols-[1.05fr_1fr]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <GlassCard className="flex h-full flex-col p-8 sm:p-10">
              <p className="text-lg leading-relaxed text-ink">{profile.aboutSecondary}</p>
              <p className="mt-4 leading-relaxed text-ink-muted">
                Day to day that means reading contracts closely, shipping backend
                systems that stay up, and giving AI agents enough structure to be
                useful without being dangerous.
              </p>

              <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.28em] text-gold">
                Focus areas
              </h3>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                className="mt-4 flex flex-wrap gap-2.5"
              >
                {coreSkills.map((skill) => (
                  <motion.div key={skill} variants={staggerItem}>
                    <Badge variant="gold">{skill}</Badge>
                  </motion.div>
                ))}
              </motion.div>
            </GlassCard>
          </motion.div>

          <TechOrbit />
        </div>

        {/* Animated statistics */}
        <motion.dl
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={staggerItem}>
              <GlassCard interactive className="p-6 text-center sm:p-8">
                <dd className="font-display text-4xl font-bold text-gold-gradient sm:text-5xl">
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </dd>
                <dt className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                  {stat.label}
                </dt>
              </GlassCard>
            </motion.div>
          ))}
        </motion.dl>

        <Journey />
        <Experience />
      </div>
    </section>
  );
}

/**
 * The stack rendered as a slow counter-rotating orbit around an AI/chain
 * core — the same signature device introduced in the hero, at a larger scale.
 */
function TechOrbit() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      <GlassCard gold className="flex h-full flex-col p-8 sm:p-10">
        <h3 className="text-center font-mono text-xs uppercase tracking-[0.28em] text-gold">
          Working stack
        </h3>

        <div className="relative mx-auto mt-8 aspect-square w-full max-w-[22rem]">
          {/* Ambient core glow */}
          <motion.div
            className="absolute inset-[28%] rounded-full bg-gold/20 blur-2xl"
            animate={reduced ? undefined : { opacity: [0.45, 0.85, 0.45] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />

          {/* AI + blockchain core */}
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="relative grid h-24 w-24 place-items-center rounded-2xl border border-gold/40 bg-background/90 backdrop-blur-sm">
              <Cpu className="h-10 w-10 text-gold" aria-hidden />
              <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
                AI · Chain
              </span>
            </div>
          </div>

          <OrbitRing
            radius={41}
            duration={54}
            reverse
            items={orbitTech.map((tech) => (
              <span
                key={tech}
                className="grid h-14 w-14 place-items-center rounded-xl border border-gold/25 bg-background/90 px-1 text-center font-mono text-[9px] font-medium leading-tight text-gold backdrop-blur-sm transition-colors duration-300 hover:border-gold/60 hover:text-white"
              >
                {tech}
              </span>
            ))}
          />
        </div>

        <p className="mt-6 text-center text-sm text-ink-faint">
          Eleven tools I reach for most across security, AI, and infrastructure work.
        </p>
      </GlassCard>
    </motion.div>
  );
}

/** Year-by-year progression, rendered as a connected horizontal track. */
function Journey() {
  return (
    <div className="mt-24">
      <div className="mb-12 flex items-center justify-center gap-3">
        <span className="h-px w-8 bg-gold/60" aria-hidden />
        <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-gold">
          Journey
        </h3>
        <span className="h-px w-8 bg-gold/60" aria-hidden />
      </div>

      <motion.ol
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4"
      >
        {/* Connecting track, desktop only */}
        <div
          className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent lg:block"
          aria-hidden
        />

        {timeline.map((entry) => (
          <motion.li key={entry.year} variants={staggerItem} className="relative">
            <div className="mb-5 flex items-center gap-3 lg:justify-center">
              <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/40 bg-background">
                <span className="font-display text-sm font-bold text-gold">
                  {entry.year}
                </span>
              </span>
              <span className="h-px flex-1 bg-gold/20 lg:hidden" aria-hidden />
            </div>

            <GlassCard interactive className="h-full p-5">
              <h4 className="font-display text-base font-semibold text-white">
                {entry.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {entry.description}
              </p>
            </GlassCard>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  );
}

/** Detailed role history, alternating sides on desktop. */
function Experience() {
  return (
    <div className="mt-24">
      <div className="mb-12 flex items-center gap-3">
        <Briefcase className="h-6 w-6 text-gold" aria-hidden />
        <h3 className="font-display text-2xl font-semibold text-white">Experience</h3>
      </div>

      <div className="relative">
        <div
          className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-gold/60 via-gold/20 to-transparent sm:left-1/2"
          aria-hidden
        />

        <div className="space-y-12">
          {experience.map((item, index) => (
            <TimelineItem key={item.role} item={item} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** A single experience entry that alternates sides on desktop. */
function TimelineItem({
  item,
  index,
}: {
  item: (typeof experience)[number];
  index: number;
}) {
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0.001, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={`relative pl-8 sm:w-1/2 sm:pl-0 ${
        isLeft ? 'sm:pr-12 sm:text-right' : 'sm:ml-auto sm:pl-12'
      }`}
    >
      <span
        className={`absolute left-[-7px] top-2 grid h-4 w-4 place-items-center rounded-full border border-gold bg-background sm:left-auto ${
          isLeft ? 'sm:right-[-8px]' : 'sm:left-[-8px]'
        }`}
        aria-hidden
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
      </span>

      <GlassCard interactive className="p-6">
        <span className="font-mono text-xs uppercase tracking-widest text-gold">
          {item.period}
        </span>
        <h4 className="mt-2 font-display text-xl font-semibold text-white">
          {item.role}
        </h4>
        <p className="text-sm text-ink-muted">{item.company}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {item.description}
        </p>
        <ul className={`mt-4 space-y-1.5 text-sm text-ink ${isLeft ? 'sm:text-right' : ''}`}>
          {item.achievements.map((a) => (
            <li key={a} className="flex items-start gap-2 sm:justify-start">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </motion.div>
  );
}
