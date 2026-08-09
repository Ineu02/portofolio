'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { ArrowRight, Download, Mail } from 'lucide-react';
import { profile, socialLinks, heroStats } from '@/lib/data';
import { ButtonLink } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';
import { ParticleField } from '@/components/ui/ParticleField';
import { OrbitRing } from '@/components/ui/OrbitRing';
import { scrollToSection } from '@/lib/utils';

/**
 * The 3D core is loaded client-side only.
 *
 * `ssr: false` is not a convenience here — the renderer measures the canvas and
 * reads devicePixelRatio on mount, neither of which exists on the server, and
 * rendering a markup-identical canvas on both sides only to immediately repaint
 * it would risk a hydration mismatch for no benefit. Splitting it out also keeps
 * the geometry maths off the critical path: the headline paints first.
 */
const HeroCore = dynamic(
  () => import('@/components/three/HeroCore').then((m) => m.HeroCore),
  { ssr: false }
);

/** Nodes that orbit the avatar — the site's signature element. */
const ORBIT_NODES = ['ETH', 'AI', 'SOL', '{ }', 'BASE', '</>'];

/** Social links promoted into the hero CTA row, in the order requested. */
const HERO_SOCIALS = ['GitHub', 'LinkedIn', 'Telegram', 'Twitter'];

/**
 * Hero section — the thesis of the page.
 *
 * The signature element is a slowly turning 3D core rendered behind the type,
 * with the avatar sitting at its heart inside its own orbital ring. The core
 * carries the depth and lighting; everything in front of it stays quiet and
 * flat so the words remain the thing you read first.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  // Scroll progress across the hero, used to hand off to the next section.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  // Content leaves slightly ahead of the 3D core, so the object is briefly
  // alone on screen. That beat is what makes the transition feel directed
  // rather than like the page simply scrolling.
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const coreOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  // Mouse position, softened by a spring. The hero no longer draws its own
  // pointer glow — this now only drives the avatar's counter-parallax, which
  // is a few pixels of movement against the fixed background behind it.
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const glowX = useSpring(mouseX, { stiffness: 50, damping: 22 });
  const glowY = useSpring(mouseY, { stiffness: 50, damping: 22 });

  // Counter-parallax on the avatar cluster, a few pixels only.
  const tiltX = useTransform(glowX, [0, 1], [12, -12]);
  const tiltY = useTransform(glowY, [0, 1], [10, -10]);

  useEffect(() => {
    if (reduced) return;
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY, reduced]);

  const heroSocials = HERO_SOCIALS.map((label) =>
    socialLinks.find((s) => s.label === label)
  ).filter((s): s is (typeof socialLinks)[number] => Boolean(s));

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pb-20 pt-32 sm:pt-36"
    >
      {/*
        Hero-local background layers. The grid that used to sit here has moved
        to the site-wide AmbientBackground — the hero is the most heavily
        layered section on the page, and one grid drawn once behind everything
        reads better than a second copy stacked under the 3D core.
      */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-gold/20 blur-[130px]"
          animate={reduced ? undefined : { scale: [1, 1.18, 1], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[8%] right-[10%] h-96 w-96 rounded-full bg-gold-700/20 blur-[150px]"
          animate={reduced ? undefined : { scale: [1.1, 1, 1.1], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/*
          Cool secondary light. It sits opposite the gold so the 3D core has
          something to separate its shaded side from the page behind it —
          the same role the fill light plays inside the renderer.
        */}
        <div
          className="absolute right-[18%] top-[30%] h-[26rem] w-[26rem] rounded-full bg-[#8b7aff]/[0.07] blur-[150px]"
          aria-hidden
        />

        {/*
          The pointer-following glow now lives in AmbientBackground, where it
          runs once for the whole page. Two of them overlapping here — eased at
          different rates — read as one blob chasing another, which is worse
          than either alone. The static washes above still light the hero.
        */}

        {/*
          The 3D core. Masked to a soft ellipse so it dissolves into the page
          instead of ending at a visible canvas edge, and held at partial
          opacity so the headline never has to compete with it for contrast.
        */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: coreOpacity,
            maskImage:
              'radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 78%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 78%)',
          }}
          aria-hidden
        >
          <HeroCore className="h-full w-full opacity-70 sm:opacity-80" />
        </motion.div>

        <ParticleField count={30} seed={11} />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <motion.div
        className="container-px w-full"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <div className="mx-auto max-w-4xl text-center">
          {/* Avatar inside the orbital system */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={reduced ? undefined : { x: tiltX, y: tiltY }}
            className="relative mx-auto mb-10 h-56 w-56 sm:h-64 sm:w-64"
          >
            {/* Outer glow */}
            <motion.div
              className="absolute inset-8 rounded-full bg-gold/25 blur-3xl"
              animate={reduced ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            />

            {/* Rotating conic ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, rgba(212,175,55,0.85) 70deg, transparent 150deg, transparent 210deg, rgba(212,175,55,0.45) 280deg, transparent 340deg)',
                maskImage:
                  'radial-gradient(circle, transparent 61%, #000 62%, #000 65%, transparent 66%)',
                WebkitMaskImage:
                  'radial-gradient(circle, transparent 61%, #000 62%, #000 65%, transparent 66%)',
              }}
              animate={reduced ? undefined : { rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              aria-hidden
            />

            {/* Orbiting chain / AI tokens */}
            <OrbitRing
              radius={48}
              duration={34}
              showTrack={false}
              items={ORBIT_NODES.map((node) => (
                <span
                  key={node}
                  className="grid h-9 w-9 place-items-center rounded-full border border-gold/30 bg-background/85 font-mono text-[10px] font-medium tracking-wider text-gold backdrop-blur-sm"
                >
                  {node}
                </span>
              ))}
            />

            {/*
              Avatar. Sits at the heart of the 3D core, so it gets a matching
              treatment: a warm inner rim where the scene's key light falls
              (upper left) and a cool violet rim opposite it, echoing the
              renderer's fill light. The image itself is untouched — the
              lighting lives entirely in the ring around it.
            */}
            <div className="absolute inset-[22%] rounded-full ring-2 ring-gold/50 shadow-gold">
              <span
                className="pointer-events-none absolute -inset-1 rounded-full opacity-70"
                style={{
                  background:
                    'radial-gradient(circle at 30% 22%, rgba(246,236,196,0.30), transparent 55%), radial-gradient(circle at 74% 80%, rgba(139,122,255,0.26), transparent 58%)',
                }}
                aria-hidden
              />
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <Image
                  src="/avatar.png"
                  alt={`Portrait of ${profile.name}`}
                  fill
                  sizes="(max-width: 640px) 124px, 142px"
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </motion.div>

          {/* Availability badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full glass px-4 py-2 text-sm text-ink-muted"
          >
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Available for security research &amp; AI engineering work
          </motion.div>

          {/*
            Headline. `pb-1` and a leading above 1 keep descenders and the
            gold gradient's clip box off the baseline — a gradient-filled
            display face at clamp() sizes will otherwise shave the bottom of
            the "g" at some viewport widths.
          */}
          <motion.h1
            initial={{ opacity: 0, y: 26, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-display-lg text-balance pb-1 leading-[1.08] text-white"
          >
            Building Secure
            <br />
            <span className="text-gold-gradient">Web3 Infrastructure</span>
            <br />
            with AI
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mx-auto mt-8 max-w-2xl text-balance text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            {profile.bio}
          </motion.p>

          {/* Primary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Magnetic>
              <ButtonLink href="#projects" size="lg">
                Explore projects
                <ArrowRight className="h-5 w-5" aria-hidden />
              </ButtonLink>
            </Magnetic>
            {/*
              The resume CTA is gated on the file actually existing. There is no
              `public/resume.pdf` yet, so linking to it would ship a button that
              404s. Until `profile.resumeAvailable` is flipped, the slot holds a
              contact CTA instead — a real destination rather than a dead one.
            */}
            <Magnetic>
              {profile.resumeAvailable ? (
                <ButtonLink
                  href={profile.resumeUrl}
                  size="lg"
                  variant="secondary"
                  external
                >
                  <Download className="h-5 w-5" aria-hidden />
                  Download resume
                </ButtonLink>
              ) : (
                <ButtonLink href="#contact" size="lg" variant="secondary">
                  <Mail className="h-5 w-5" aria-hidden />
                  Get in touch
                </ButtonLink>
              )}
            </Magnetic>
          </motion.div>

          {/* Social CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            {heroSocials.map((social) => {
              const Icon = social.icon;
              const label = social.label === 'Twitter' ? 'X' : social.label;
              return (
                <Magnetic key={social.label} strength={8}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex h-11 items-center gap-2 rounded-full glass px-5 text-sm text-ink-muted transition-colors duration-300 hover:border-gold/40 hover:text-gold"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </a>
                </Magnetic>
              );
            })}
          </motion.div>

          {/* Statistic cards */}
          <motion.dl
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.09, delayChildren: 0.95 } },
            }}
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          >
            {heroStats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={reduced ? undefined : { y: -5 }}
                className="group relative overflow-hidden rounded-2xl glass px-4 py-5 text-center transition-colors duration-500 hover:border-gold/35 sm:px-5 sm:py-6"
              >
                <span
                  className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden
                />
                <dd className="font-display text-3xl font-bold text-gold-gradient sm:text-4xl">
                  {stat.display}
                </dd>
                <dt className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                  {stat.label}
                </dt>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => scrollToSection('#about')}
        aria-label="Scroll to the About section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <motion.span
            className="h-2 w-1 rounded-full bg-gold"
            animate={reduced ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.button>
    </section>
  );
}
