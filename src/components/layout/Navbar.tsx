'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { navLinks, profile } from '@/lib/data';
import { useActiveSection, useScrollThreshold } from '@/lib/hooks';
import { scrollToSection, cn } from '@/lib/utils';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Sticky navigation bar. Transparent at the top of the page, it adopts a
 * frosted-glass background once the user scrolls. Includes an animated
 * mobile menu with a full-screen overlay.
 *
 * Links are route-aware. The sections only exist on the home page, so on a
 * case-study route (`/projects/[slug]`) a bare `#about` would scroll nowhere
 * and the nav would be dead. Off-home, each item becomes a real `/#about`
 * link that navigates home first.
 */
export function Navbar() {
  const scrolled = useScrollThreshold(40);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  // Stable identity so the observer isn't torn down on every render.
  const hashes = useMemo(() => navLinks.map((link) => link.href), []);
  const active = useActiveSection(hashes);

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  /** Real href, so middle-click and "open in new tab" behave. */
  const hrefFor = (hash: string) => (isHome ? hash : `/${hash}`);

  /** On the home page, intercept for a smooth scroll instead of a jump. */
  const handleNav = (e: React.MouseEvent, href: string) => {
    setOpen(false);
    if (!isHome) return;
    e.preventDefault();
    scrollToSection(href);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className={cn(
          'fixed inset-x-0 top-0 z-[110] transition-all duration-500',
          scrolled ? 'py-3' : 'py-5'
        )}
      >
        <nav
          className={cn(
            'container-px mx-auto flex items-center justify-between rounded-full transition-all duration-500',
            scrolled &&
              'max-w-5xl border border-white/10 bg-background/70 py-2 pl-6 pr-2 backdrop-blur-xl'
          )}
          aria-label="Primary"
        >
          {/* Brand */}
          <Link
            href={hrefFor('#home')}
            onClick={(e) => handleNav(e, '#home')}
            className="group flex items-center gap-3"
            aria-label={`${profile.firstName} — back to top`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg glass-strong font-display text-sm font-bold text-gold-gradient">
              {initials}
            </span>
            <span className="hidden font-display text-lg font-semibold text-white sm:block">
              {profile.firstName}
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => {
              const isActive = isHome && active === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={hrefFor(link.href)}
                    onClick={(e) => handleNav(e, link.href)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative block rounded-full px-4 py-2 text-sm transition-colors duration-300',
                      isActive ? 'text-white' : 'text-ink-muted hover:text-white'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-white/[0.07] ring-1 ring-gold/25"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        aria-hidden
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <ButtonLink href={hrefFor('#contact')} size="sm" variant="primary">
              Let&apos;s talk
            </ButtonLink>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg glass-strong text-white lg:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[105] bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <motion.ul
              className="flex h-full flex-col items-center justify-center gap-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
              }}
            >
              {navLinks.map((link) => (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    href={hrefFor(link.href)}
                    onClick={(e) => handleNav(e, link.href)}
                    aria-current={
                      isHome && active === link.href ? 'true' : undefined
                    }
                    className={cn(
                      'font-display text-3xl font-semibold transition-colors duration-300',
                      isHome && active === link.href
                        ? 'text-gold'
                        : 'text-ink-muted hover:text-gold'
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
              <motion.li
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="mt-6"
              >
                <ButtonLink
                  href={hrefFor('#contact')}
                  size="lg"
                  onClick={() => setOpen(false)}
                >
                  Let&apos;s talk
                </ButtonLink>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
