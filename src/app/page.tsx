import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Projects } from '@/components/sections/Projects';
import { OpenSource } from '@/components/sections/OpenSource';
import { Services } from '@/components/sections/Services';
import { TechStack } from '@/components/sections/TechStack';
import { ProofOfWork } from '@/components/sections/ProofOfWork';
import { Blog } from '@/components/sections/Blog';
import { Contact } from '@/components/sections/Contact';

export const metadata: Metadata = {
  description:
    'Independent Web3 security researcher and AI engineer building autonomous agents, blockchain infrastructure, security tooling, and Web3 automation systems.',
};

/**
 * Home page. Sections are composed inside the AppShell, which provides
 * the loading screen, cursor, navigation, scroll effects, and footer.
 *
 * Proof of Work sits directly after the project grid: the grid describes work
 * that is mostly private, so the checkable destinations belong immediately
 * after it rather than buried at the bottom of the page.
 *
 * Open Source sits between them and renders only when `repositories` in the
 * data layer has entries. While that array is empty the section disappears
 * entirely rather than showing a "coming soon" placeholder, so the page never
 * advertises public code that isn't there.
 *
 * There is no testimonials section. The three entries that used to feed it were
 * illustrative rather than real client quotes, and a quote attributed to a
 * company that never said it is invented social proof no matter how it is
 * labelled. Both the data and the carousel were removed; the section returns
 * when there is a real client willing to be quoted.
 */
export default function HomePage() {
  return (
    <AppShell>
      <Hero />
      <About />
      <Projects />
      <OpenSource />
      <ProofOfWork />
      <Services />
      <TechStack />
      <Blog />
      <Contact />
    </AppShell>
  );
}
