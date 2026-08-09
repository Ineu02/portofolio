'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { proofOfWork } from '@/lib/data';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { staggerContainer, staggerItem, viewportOnce } from '@/lib/animations';

/**
 * Proof of Work — the verifiable counterweight to the rest of the page.
 *
 * Every entry links somewhere a stranger can actually check. The list is short
 * because that is what is genuinely public right now; padding it with
 * aspirational links would defeat the one job this section has.
 */
export function ProofOfWork() {
  return (
    <section id="proof" className="relative py-24 sm:py-32">
      <div className="container-px relative">
        <SectionHeading
          eyebrow="Proof of work"
          title="Check it"
          highlight="yourself"
          description="Public destinations rather than claims. Most project work sits in private repositories, so this list is deliberately short — it will grow as repos and deployments go public."
        />

        <motion.ul
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-2"
        >
          {proofOfWork.map((item) => {
            const Icon = item.icon;
            return (
              <motion.li key={item.label} variants={staggerItem}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full items-start gap-4 rounded-2xl glass p-6 transition-colors duration-500 hover:border-gold/35"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-gold transition-colors duration-500 group-hover:bg-gold/10">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 font-display text-lg font-semibold text-white">
                      {item.label}
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-ink-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                        aria-hidden
                      />
                      <span className="sr-only">(opens in a new tab)</span>
                    </span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-ink-muted">
                      {item.description}
                    </span>
                  </span>
                </a>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
