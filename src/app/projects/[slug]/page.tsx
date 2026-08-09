import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projects } from '@/lib/data';
import { AppShell } from '@/components/layout/AppShell';
import { CaseStudy } from '@/components/sections/CaseStudy';

/**
 * Case study pages, one per featured project, at `/projects/[slug]`.
 *
 * Statically generated from the same `projects` array the grid reads, so a
 * card's "Case study" link can never point at a route that does not exist.
 */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.id }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);

  if (!project) return { title: 'Project not found' };

  // Status appears in the description so a search result cannot imply that a
  // private or prototype project is a live product.
  const description = `${project.status} — ${project.statusNote}. ${project.overview}`;

  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      title: `${project.title} — Kenzi Aridzky`,
      description,
      type: 'article',
      url: `/projects/${project.id}`,
      images: [{ url: project.image, alt: project.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} — Kenzi Aridzky`,
      description,
      images: [project.image],
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);

  if (!project) notFound();

  return (
    <AppShell>
      <CaseStudy project={project} />
    </AppShell>
  );
}
