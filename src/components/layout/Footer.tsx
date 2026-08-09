'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { navLinks, socialLinks, profile } from '@/lib/data';
import { scrollToSection } from '@/lib/utils';

/**
 * Site footer with brand statement, quick links, social icons, an animated
 * gold divider, and a back-to-top control. Fully responsive across
 * breakpoints; the divider shimmer is skipped under reduced motion.
 *
 * Like the navbar, the section links are route-aware: the sections exist only
 * on the home page, so off-home they navigate to `/#section` rather than
 * calling a scroll that would find no target.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const hrefFor = (hash: string) => (isHome ? hash : `/${hash}`);

  const handleNav = (e: React.MouseEvent, href: string) => {
    if (!isHome) return;
    e.preventDefault();
    scrollToSection(href);
  };

  return (
    <footer className="relative border-t border-white/10 bg-surface/50">
      <div className="bg-gold-radial absolute inset-x-0 top-0 h-40 opacity-40" aria-hidden />

      {/* Animated separator — a light travelling along the top edge */}
      <div className="absolute inset-x-0 top-0 h-px overflow-hidden" aria-hidden>
        <motion.div
          className="h-px w-1/3 bg-gradient-to-r from-transparent via-gold to-transparent"
          animate={reduced ? undefined : { x: ['-100%', '400%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container-px relative py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <h3 className="font-display text-2xl font-semibold text-white">
              {profile.firstName}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              {profile.tagline}
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="link-underline mt-6 inline-flex items-center gap-2 text-sm text-gold"
            >
              {profile.email}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer">
            <h4 className="font-mono text-xs uppercase tracking-[0.3em] text-ink-faint">
              Navigate
            </h4>
            <ul className="mt-5 space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={hrefFor(link.href)}
                    onClick={(e) => handleNav(e, link.href)}
                    className="text-sm text-ink-muted transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-[0.3em] text-ink-faint">
              Connect
            </h4>
            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                const isMail = social.href.startsWith('mailto:');
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    {...(isMail
                      ? {}
                      : { target: '_blank', rel: 'noopener noreferrer' })}
                    aria-label={social.label === 'Twitter' ? 'X' : social.label}
                    whileHover={reduced ? undefined : { y: -3 }}
                    className="grid h-11 w-11 place-items-center rounded-xl glass text-ink-muted transition-colors duration-300 hover:border-gold/40 hover:text-gold"
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 text-sm text-ink-faint sm:flex-row">
          <p>
            © {year} {profile.firstName}. All rights reserved.
          </p>

          <button
            type="button"
            onClick={() =>
              isHome
                ? scrollToSection('#home')
                : window.scrollTo({ top: 0, behavior: 'smooth' })
            }
            className="group inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm text-ink-muted transition-colors duration-300 hover:border-gold/40 hover:text-gold"
          >
            Back to top
            <ArrowUp
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </button>
        </div>
      </div>
    </footer>
  );
}
