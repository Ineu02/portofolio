import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { profile, projects } from '@/lib/data';
import { projectDetails } from '@/lib/project-details';
import { AppShell } from '@/components/layout/AppShell';
import { CaseStudy } from '@/components/sections/CaseStudy';
import type { ProjectWithDetail } from '@/types';

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

/**
 * Look up a project and attach its case-study prose.
 *
 * Returns `null` when either half is missing rather than rendering a page with
 * empty sections: the card grid links here unconditionally, so a project whose
 * prose has not been written yet must 404 loudly instead of shipping a shell.
 */
function findProject(slug: string): ProjectWithDetail | null {
  const project = projects.find((p) => p.id === slug);
  const detail = projectDetails[slug];
  if (!project || !detail) return null;
  return { ...project, ...detail };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);

  if (!project) return { title: 'Project not found' };

  // Status appears in the description so a search result cannot imply that a
  // private or prototype project is a live product.
  const description = `${project.status} — ${project.statusNote}. ${project.overview}`;

  // The social titles are built from `profile.name`, not a typed-out copy of it.
  // The root layout's title template already appends the name, but Open Graph
  // and Twitter titles bypass that template, so they had their own hardcoded
  // duplicate — the kind that survives a rename and contradicts the page.
  const socialTitle = `${project.title} — ${profile.name}`;

  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      title: socialTitle,
      description,
      type: 'article',
      url: `/projects/${project.id}`,
      images: [{ url: project.image, alt: project.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [project.image],
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = findProject(slug);

  if (!project) notFound();

  return (
    <AppShell>
      <CaseStudy project={project} />
    </AppShell>
  );
}
