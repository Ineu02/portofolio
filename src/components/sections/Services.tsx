'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { services } from '@/lib/data';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Tilt3D } from '@/components/ui/Tilt3D';
import { staggerContainer, staggerItem, viewportOnce } from '@/lib/animations';

/**
 * Services section — a responsive grid of tactile cards. Each card tilts
 * toward the cursor, the icon lifts off the card face, and a gold glow
 * blooms behind it. Under `prefers-reduced-motion` the tilt drops out
 * entirely and the cards render flat.
 */
export function Services() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="container-px">
        <SectionHeading
          eyebrow="What I offer"
          title="Services built for"
          highlight="Web3 & AI"
          description="Six areas I work in end to end — from autonomous agents and contract review through to the cloud systems that keep them running."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.title} variants={staggerItem} className="h-full">
                {/*
                  A touch more tilt than the project cards get. These hold short
                  lists rather than paragraphs, so the type survives a steeper
                  angle, and the extra depth is what makes them feel tactile.
                */}
                <Tilt3D className="h-full" maxTilt={8} lift={16}>
                <GlassCard
                  className="group relative h-full overflow-hidden p-8"
                >
                  {/* Hover glow */}
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gold/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Animated top border that draws in on hover */}
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-gold to-transparent transition-transform duration-700 group-hover:scale-x-100"
                    aria-hidden
                  />

                  {/*
                    Icon. It lifts off the card face on hover — `translateZ`
                    inside the tilt's preserve-3d context, so it genuinely
                    parallaxes against the card as the card turns rather than
                    just scaling in place.
                  */}
                  <div className="relative grid h-14 w-14 place-items-center rounded-2xl glass-strong transition-all duration-500 [transform:translateZ(0px)] group-hover:border-gold/40 group-hover:[transform:translateZ(34px)]">
                    <Icon className="h-7 w-7 text-gold transition-transform duration-500 group-hover:scale-110" aria-hidden />
                  </div>

                  <h3 className="relative mt-6 font-display text-xl font-semibold text-white transition-colors duration-300 group-hover:text-gold">
                    {service.title}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-ink-muted">
                    {service.description}
                  </p>

                  {/* Feature list */}
                  <ul className="relative mt-6 space-y-2">
                    {service.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-ink"
                      >
                        <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gold/15" aria-hidden>
                          <Check className="h-2.5 w-2.5 text-gold" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
                </Tilt3D>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
