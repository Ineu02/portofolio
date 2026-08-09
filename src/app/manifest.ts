import type { MetadataRoute } from 'next';

/** PWA-lite web manifest for installability and theming. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kenzi Aridzky — Portfolio',
    short_name: 'Kenzi Aridzky',
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
