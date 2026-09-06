import type { MetadataRoute } from 'next';
import { profile } from '@/lib/data';

/**
 * PWA-lite web manifest for installability and theming.
 *
 * The names come from `profile` rather than being typed out again — this file
 * held its own copy of the display name, which is how it would quietly keep the
 * old one after a rename.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${profile.name} — Portfolio`,
    short_name: profile.name,
    description:
      'Blockchain Security Researcher, AI Agent Developer, Bug Hunter, and Web3 Builder.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#050505',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
