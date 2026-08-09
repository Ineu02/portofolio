# Alex Rivera — Premium Portfolio

A production-ready, world-class personal portfolio built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. Dark by default with a luxury black + gold palette, glassmorphism, smooth motion, and full SEO/accessibility support.

![Tech](https://img.shields.io/badge/Next.js-15-black) ![TS](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ Features

- **Design** — Luxury black + gold theme, glassmorphism, gold-gradient accents, refined typography (Playfair Display + Inter + JetBrains Mono).
- **Sections** — Hero, About (bio, skills, animated stats, experience timeline), Projects (filterable), Services, Tech Stack (grid + progress bars), Testimonials (carousel), Blog preview, Contact (validated form), Footer.
- **Motion** — Framer Motion throughout: page transitions, scroll reveals, animated counters, rotating headline, mouse-parallax hero glow.
- **UX chrome** — Loading screen, custom animated cursor, scroll progress indicator, back-to-top button, sticky glass navbar with mobile menu, smooth scrolling.
- **Performance & SEO** — `next/font`, `next/image` optimization, lazy loading, metadata + Open Graph + Twitter cards, JSON-LD structured data, sitemap, robots, web manifest, security headers.
- **Accessibility** — Skip link, focus-visible rings, ARIA labels, `prefers-reduced-motion` support, semantic HTML.

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev

# 3. Open http://localhost:3000
```

### Build for production

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## 🗂️ Project structure

```
portfolio/
├── src/
│   ├── app/                  # App Router: layout, page, metadata, sitemap, robots, manifest
│   │   ├── layout.tsx        # Root layout: fonts, SEO, JSON-LD, skip link
│   │   ├── page.tsx          # Home page composing all sections
│   │   ├── globals.css       # Theme, glass utilities, scrollbar, a11y
│   │   ├── not-found.tsx     # Custom 404
│   │   ├── sitemap.ts / robots.ts / manifest.ts / icon.svg
│   ├── components/
│   │   ├── layout/           # AppShell, Navbar, Footer, LoadingScreen,
│   │   │                     # CustomCursor, ScrollProgress, BackToTop
│   │   ├── sections/         # Hero, About, Projects, Services, TechStack,
│   │   │                     # Testimonials, Blog, Contact
│   │   └── ui/               # Button, GlassCard, SectionHeading, Badge,
│   │                         # AnimatedCounter, ProgressBar
│   ├── lib/                  # data.ts (content), utils.ts, animations.ts, hooks.ts
│   └── types/                # Shared TypeScript types
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

## 🎨 Customization

All content lives in **`src/lib/data.ts`** — edit your name, bio, projects, experience, services, tech stack, testimonials, and blog posts there. The color palette is defined in **`tailwind.config.ts`** under `colors.gold`.

- Replace placeholder profile info (name, email, location, social URLs).
- Swap the Unsplash image URLs for your own project screenshots (add hostnames to `next.config.js` `images.remotePatterns` if needed).
- Wire the contact form's `handleSubmit` in `src/components/sections/Contact.tsx` to your API route or an email service (e.g. Resend, Formspree).
- Add an `og-image.png` (1200×630) to `public/` for social sharing.

## 🛠️ Tech stack

Next.js 15 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion · lucide-react

## 📄 License

MIT — free to use and adapt for your own portfolio.
