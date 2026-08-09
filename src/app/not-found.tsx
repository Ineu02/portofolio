import Link from 'next/link';

/** Custom 404 page matching the site's luxury aesthetic. */
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div className="grid-pattern absolute inset-0 -z-10 opacity-40" />
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-gold">
          Error 404
        </p>
        <h1 className="mt-4 font-display text-display-md text-gold-gradient">
          Lost in space
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ink-muted">
          The page you&apos;re looking for drifted off into the void. Let&apos;s get
          you back home.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-gold-gradient px-7 py-3 font-medium text-background transition-transform hover:scale-105"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
