'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, PenLine } from 'lucide-react';
import { blogPosts } from '@/lib/data';
import type { BlogPost } from '@/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { staggerContainer, staggerItem, viewportOnce } from '@/lib/animations';

/**
 * Blog preview — a grid of article cards with cover images, category, and
 * read time. Posts that have a `href` link out to the published piece;
 * posts still being written render unlinked with a "Publishing soon" tag
 * rather than a dead anchor.
 */
export function Blog() {
  return (
    <section id="blog" className="relative py-24 sm:py-32">
      <div className="container-px">
        <SectionHeading
          align="left"
          eyebrow="Writing"
          title="In the"
          highlight="works"
          description="Planned pieces on smart contract security, autonomous agents, MEV, and running Web3 infrastructure under load. None are published yet — the titles below are what I am writing, not links."
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {blogPosts.map((post) => (
            <motion.article key={post.id} variants={staggerItem}>
              <PostShell post={post}>
                <PostCard post={post} />
              </PostShell>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Wraps a published post in an anchor; leaves an unpublished one as a plain
 * container so nothing presents itself as clickable when it isn't.
 */
function PostShell({ post, children }: { post: BlogPost; children: ReactNode }) {
  if (!post.published || !post.href) return <div className="h-full">{children}</div>;

  return (
    <a href={post.href} className="block h-full" aria-label={`Read: ${post.title}`}>
      {children}
    </a>
  );
}

/** The card body, shared by published and upcoming posts. */
function PostCard({ post }: { post: BlogPost }) {
  // Driven by the explicit flag rather than by the presence of an href, so a
  // half-filled entry can never render as if it were live.
  const published = post.published && Boolean(post.href);

  return (
    <GlassCard interactive={published} className="group flex h-full flex-col">
      {/* Cover */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <span className="absolute left-3 top-3">
          <Badge variant="gold">{post.category}</Badge>
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        {/*
          Date and reading time only exist for real articles. Rendering the row
          for a draft produced an empty clock icon and an invented timestamp.
        */}
        {published && (
          <div className="flex items-center gap-3 text-xs text-ink-faint">
            {post.date && <span>{post.date}</span>}
            {post.readTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                {post.readTime}
              </span>
            )}
          </div>
        )}

        <h3
          className={`font-display text-lg font-semibold leading-snug text-white ${
            published ? 'mt-3 transition-colors duration-300 group-hover:text-gold' : ''
          }`}
        >
          {post.title}
        </h3>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
          {post.excerpt}
        </p>

        {published ? (
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold">
            Read article
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        ) : (
          <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            <PenLine className="h-3.5 w-3.5" aria-hidden />
            Publishing soon
          </span>
        )}
      </div>
    </GlassCard>
  );
}
