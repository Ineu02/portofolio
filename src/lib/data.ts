/**
 * Central content source for the portfolio.
 *
 * Every section reads from here, so content is edited in exactly one place.
 *
 * AUTHENTICITY RULES — please keep these when editing:
 *
 * 1. No invented URLs. A project's `github` / `demo` is either a real, specific
 *    destination or `null`. `null` hides the corresponding button rather than
 *    rendering one that goes nowhere. Never point these at a profile root or
 *    homepage to fill a gap — that reads as a working link but isn't one.
 * 2. `verified` stays `false` until you have personally opened the link and
 *    confirmed it resolves. It gates the "Verified" marker in the UI.
 * 3. No unverifiable statistics. Counts like "50+ contracts audited" were
 *    removed because nothing here substantiates them. If you add a number back,
 *    make sure a visitor could check it.
 * 4. `resumeAvailable` must stay `false` until `public/resume.pdf` genuinely
 *    exists. While false, the hero shows an honest "on request" affordance
 *    instead of a download button that 404s.
 */

import {
  Github,
  Linkedin,
  Twitter,
  Send,
  Mail,
  Bot,
  ShieldCheck,
  Boxes,
  Cloud,
  Search,
  Workflow,
} from 'lucide-react';
import type {
  NavLink,
  SocialLink,
  Stat,
  HeroStat,
  ExperienceItem,
  Project,
  Repository,
  Service,
  ProofItem,
  TechGroup,
  TimelineEntry,
  Testimonial,
  BlogPost,
} from '@/types';
import { SITE_URL } from '@/lib/site';

export const profile = {
  /**
   * Display identity, and the only place it is spelled out.
   *
   * `Bandidoz` is the handle the whole presence already runs on — the domain,
   * the LinkedIn slug — so the site now uses it rather than a separate legal
   * name. Two things are derived from this string and will follow it
   * automatically: the monogram in the navbar and loading screen
   * (`name.split(' ').map(n => n[0]).join('')`, so a one-word name yields `B`),
   * and `metadata.title.template` / `authors` / `creator` / `openGraph.siteName`
   * in `app/layout.tsx`. Restoring a surname here is enough to bring the
   * two-letter monogram back with it.
   */
  name: 'Bandidoz',
  firstName: 'Bandidoz',
  role: 'Blockchain Security Researcher | AI Agent Developer | Web3 Builder | Bug Hunter | Airdrop Hunter',
  tagline: 'Building Secure Web3 Infrastructure with AI',
  headlineWords: ['infrastructure', 'AI agents', 'security tools', 'automation'],
  location: 'Indonesia',
  email: 'kenzi5942@gmail.com',
  website: SITE_URL,
  resumeUrl: '/resume.pdf',
  /**
   * Flip to `true` only once `public/resume.pdf` actually exists. The hero
   * reads this to decide between a real download link and an email request,
   * so a premature `true` ships a 404.
   */
  resumeAvailable: false,
  bio: `Blockchain Security Researcher specializing in smart contract security, artificial intelligence, blockchain infrastructure, autonomous AI agents, cloud systems, and Web3 automation.`,
  bioShort:
    'Blockchain Security Researcher, AI Agent Developer, Bug Hunter, and Web3 Builder specializing in autonomous AI systems and blockchain infrastructure.',
  about: `I design and build AI-powered blockchain infrastructure, security platforms, autonomous AI agents, smart contract tooling, cloud-native backend systems, and Web3 automation.`,
  aboutSecondary: `My work combines security research, distributed systems, artificial intelligence, and scalable infrastructure.`,
} as const;

export const navLinks: NavLink[] = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Services', href: '#services' },
  { label: 'Stack', href: '#stack' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
];

/**
 * Outbound links to profiles elsewhere.
 *
 * Every entry must be a destination that is *not* this site. A "Website" entry
 * pointing at `bandidoz.xyz` used to sit here; that host is now dead, and
 * repointing it at the current origin would only have produced a link, rendered
 * in the footer of every page, to the page the visitor is already reading. The
 * site's own origin lives in `@/lib/site` and is consumed by metadata, not by a
 * link list.
 */
export const socialLinks: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/Ineu02', icon: Github },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/bandidoz-x-904720240/',
    icon: Linkedin,
  },
  { label: 'Twitter', href: 'https://x.com/maxwelxyz', icon: Twitter },
  { label: 'Telegram', href: 'https://t.me/chandrairawa', icon: Send },
  { label: 'Email', href: 'mailto:kenzi5942@gmail.com', icon: Mail },
];

/**
 * Hero statistic cards.
 *
 * These are deliberately modest. Earlier versions claimed "4+ Years Experience",
 * "15+ Technologies" and "24/7 Building" — none of which a visitor could check,
 * and the last of which isn't even a fact. What remains is derived from content
 * on this page: the project count matches `projects.length`, the focus areas
 * match `techGroups`, and the start year matches the first timeline entry.
 */
export const heroStats: HeroStat[] = [
  { label: 'Featured projects', display: '6', value: 6 },
  { label: 'Building since', display: '2022' },
  { label: 'Focus areas', display: 'AI · Security · Web3' },
  { label: 'Work', display: 'Independent' },
];

/**
 * About-section figures. Every one of these is checkable against this page:
 * counts come from the data arrays below, and the start year comes from the
 * timeline. Removed from the previous version: "10+ Blockchain Networks",
 * which nothing here substantiates.
 */
export const stats: Stat[] = [
  { label: 'Featured projects', value: 6 },
  { label: 'Technology areas', value: 6 },
  { label: 'Building since', value: 2022, literal: true },
];

/** Technologies that ride the animated orbit in the About section. */
export const orbitTech: string[] = [
  'Python',
  'TypeScript',
  'Rust',
  'Solidity',
  'Docker',
  'Linux',
  'AWS',
  'Next.js',
  'OpenAI',
  'Claude',
  'Gemini',
];

export const coreSkills: string[] = [
  'Smart Contract Security',
  'AI Agents',
  'Blockchain Infrastructure',
  'DeFi',
  'Layer 2 Ecosystems',
  'Cross-chain Systems',
  'Automation',
  'Bug Hunting',
  'Open Source',
];

/**
 * Learning and building progression, rendered as the vertical timeline.
 *
 * Every entry carries an explicit `kind` label so the timeline reads as a record
 * of independent work rather than an implied employment history. The 2024 entry
 * previously said workflows ran "in production" and 2025 said infrastructure was
 * "shipped" — both were softened, since neither has a public deployment behind
 * it. No employer, client, or publication appears here by design.
 */
export const timeline: TimelineEntry[] = [
  {
    year: '2022',
    title: 'Started blockchain development',
    kind: 'Self-taught',
    description:
      'Began building on EVM chains: first Solidity contracts and the fundamentals of decentralised systems.',
  },
  {
    year: '2023',
    title: 'Moved into security research',
    kind: 'Independent research',
    description:
      'Shifted focus to vulnerability research — reading contracts, studying historical exploits, and mapping common attack surfaces.',
  },
  {
    year: '2024',
    title: 'AI automation systems',
    kind: 'Independent development',
    description:
      'Started building LLM-driven automation: multi-provider orchestration, tool execution, and agentic workflows.',
  },
  {
    year: '2025',
    title: 'Web3 infrastructure',
    kind: 'Independent development',
    description:
      'Built out backend pieces — RPC access, indexing, wallet integration, and containerised deployment.',
  },
  {
    year: '2026',
    title: 'Autonomous agents',
    kind: 'Current focus',
    description:
      'Working on agents that reason, plan, and act across blockchain and cloud environments.',
  },
];

/**
 * Self-directed work tracks, not employment history.
 *
 * `company` says "Independent" on every entry because that is what these are —
 * no employer or client is named anywhere, and none should be added without a
 * real engagement behind it.
 *
 * The `achievements` lists previously carried counts ("50+ smart contracts",
 * "10+ production AI agent systems", "15+ Web3 automation utilities") and a
 * claim of published research. All were removed: nothing on this site or in the
 * repositories substantiates them. What replaces them describes the actual
 * nature of the work, which is checkable against the projects above.
 */
export const experience: ExperienceItem[] = [
  {
    role: 'Blockchain Security Research',
    company: 'Independent',
    period: '2023 — Present',
    description:
      'Self-directed research into smart contract vulnerabilities, exploit techniques, and Web3 security practices.',
    achievements: [
      'Read and analyse contracts to build a working catalogue of vulnerability patterns',
      'Study post-mortems of historical exploits to understand root causes',
      'Write and run Foundry test cases that reproduce known attack classes',
    ],
  },
  {
    role: 'AI Agent Development',
    company: 'Independent',
    period: '2024 — Present',
    description:
      'Building autonomous agents that reason, hold memory, execute tools, and run multi-step workflows.',
    achievements: [
      'Design agent loops covering planning, tool execution, and failure recovery',
      'Integrate multiple LLM providers behind one interface with failover',
      'Operate agents through Telegram as the control surface',
    ],
  },
  {
    role: 'Web3 Engineering',
    company: 'Independent',
    period: '2022 — Present',
    description:
      'Building blockchain utilities, automation tooling, and the backend infrastructure they run on.',
    achievements: [
      'Write wallet monitoring and on-chain automation tooling',
      'Build read paths against EVM chains with RPC and indexer layers',
      'Containerise and deploy services on Linux with reverse proxying',
    ],
  },
];

/**
 * Public repositories for the "Open Source & Experiments" section.
 *
 * WHAT IS CONFIRMED HERE: the repository names and, from them, the URLs.
 * Bandidoz supplied this list directly, so the names are real and each URL
 * follows the one rule that matters — `github.com/Ineu02/<exact-name>`, never a
 * guessed slug and never the profile root.
 *
 * WHAT IS NOT CONFIRMED: everything else. Descriptions, primary languages, and
 * publication status could not be read, because GitHub is unreachable from the
 * environment this was built in. Those fields are `null`, and the UI renders
 * "Details pending verification" rather than inventing a plausible sentence.
 *
 * Every entry is `origin: 'unverified'` for one specific reason: Bandidoz said
 * several of these are forks but did not say which. A guess would eventually
 * label someone else's project as their original work, which is the worst
 * available outcome — so no entry claims a classification until it is checked.
 * The badge reads "Pending verification" until then, which is accurate for a
 * fork and for original work alike.
 *
 * TO COMPLETE AN ENTRY, open the repo and fill in what you see:
 *
 *   {
 *     name: 'sail',
 *     url: 'https://github.com/Ineu02/sail',
 *     description: 'whatever the repo description says',
 *     language: 'Rust',                  // GitHub's primary language
 *     status: 'OPEN SOURCE',
 *     origin: 'original',                // or 'research' for a PoC
 *   }
 *
 * For a fork, `upstream` is mandatory — the type will not compile without it:
 *
 *   { name: 'seal', url: '...', origin: 'fork', upstream: 'owner/seal', ... }
 *
 * The list is intentionally partial: it holds the ten repositories named so far,
 * not "and the other repositories" as a catch-all, because an unnamed repo has
 * no name and no URL and therefore nothing truthful to render. Add the rest the
 * same way.
 */
export const repositories: Repository[] = [
  {
    name: 'echogarden-poc',
    url: 'https://github.com/Ineu02/echogarden-poc',
    description: null,
    language: null,
    status: null,
    origin: 'unverified',
  },
  {
    name: 'soundness-attention-miner',
    url: 'https://github.com/Ineu02/soundness-attention-miner',
    description: null,
    language: null,
    status: null,
    origin: 'unverified',
  },
  {
    name: 'bandidozeth',
    url: 'https://github.com/Ineu02/bandidozeth',
    description: null,
    language: null,
    status: null,
    origin: 'unverified',
  },
  {
    name: 'sail',
    url: 'https://github.com/Ineu02/sail',
    description: null,
    language: null,
    status: null,
    origin: 'unverified',
  },
  {
    name: 'seal',
    url: 'https://github.com/Ineu02/seal',
    description: null,
    language: null,
    status: null,
    origin: 'unverified',
  },
  {
    name: 'seal02',
    url: 'https://github.com/Ineu02/seal02',
    description: null,
    language: null,
    status: null,
    origin: 'unverified',
  },
  {
    name: 'seal-sui',
    url: 'https://github.com/Ineu02/seal-sui',
    description: null,
    language: null,
    status: null,
    origin: 'unverified',
  },
  {
    name: 'Aleo-tictato',
    url: 'https://github.com/Ineu02/Aleo-tictato',
    description: null,
    language: null,
    status: null,
    origin: 'unverified',
  },
  {
    name: 'Solana-arbitrage-bot',
    url: 'https://github.com/Ineu02/Solana-arbitrage-bot',
    description: null,
    language: null,
    status: null,
    origin: 'unverified',
  },
  {
    name: 'polymarket-trading-bot',
    url: 'https://github.com/Ineu02/polymarket-trading-bot',
    description: null,
    language: null,
    status: null,
    origin: 'unverified',
  },
];

/**
 * The six featured projects.
 *
 * Every `github` and `demo` is `null`. They previously pointed at
 * `github.com/Ineu02` (a profile root, not a repository) and `bandidoz.xyz`
 * (a homepage, not a deployment — and since dead besides), which rendered
 * "Code" and "Live Demo" buttons that did not go where they claimed. Replace a
 * `null` with a specific URL as each repo or deployment goes public, and set
 * `verified: true` only after opening it yourself.
 *
 * Case-study copy describes design and intent — the parts that are true of the
 * work itself. It deliberately contains no user counts, revenue, transaction
 * volumes, audit findings, or performance benchmarks, because none of those are
 * measurable from what exists.
 */
export const projects: Project[] = [
  {
    id: 'hermes',
    title: 'Hermes AI Agent',
    description:
      'Autonomous agent runtime with persistent memory, tool execution, and multi-provider reasoning, operated through Telegram.',
    image: '/covers/hermes.svg',
    imageKind: 'concept',
    imageAlt: 'Hermes AI Agent architecture visualisation',
    category: 'AI Agents',
    status: 'PRIVATE',
    origin: 'private',
    statusNote: 'Source not public',
    tech: [
      'Python',
      'FastAPI',
      'Claude',
      'Gemini',
      'OpenRouter',
      'SQLite',
      'Docker',
      'Telegram',
    ],
    github: null,
    demo: null,
    caseStudy: '/projects/hermes',
    verified: false,
    featured: true,
  },
  {
    id: '9router',
    title: '9Router AI Platform',
    description:
      'LLM routing layer that presents one API across OpenAI, Claude, Gemini, and OpenRouter, with health-based routing and failover.',
    image: '/covers/9router.svg',
    imageKind: 'concept',
    imageAlt: '9Router request-routing flow visualisation',
    category: 'Infrastructure',
    status: 'PROTOTYPE',
    origin: 'original',
    statusNote: 'Working build, not publicly deployed',
    tech: ['Next.js', 'TypeScript', 'Redis', 'Node.js', 'Docker', 'OpenAI API'],
    github: null,
    demo: null,
    caseStudy: '/projects/9router',
    verified: false,
    featured: true,
  },
  {
    id: 'security-research',
    title: 'Blockchain Security Research',
    description:
      'Ongoing research into smart contract vulnerability classes, MEV, and protocol attack surfaces, with reproductions written as Foundry tests.',
    image: '/covers/security-research.svg',
    imageKind: 'concept',
    imageAlt: 'Smart contract attack-surface analysis visualisation',
    category: 'Security',
    status: 'RESEARCH',
    origin: 'research',
    statusNote: 'Ongoing, no public artifact',
    tech: ['Solidity', 'Foundry', 'Rust', 'Python', 'Slither'],
    github: null,
    demo: null,
    caseStudy: '/projects/security-research',
    verified: false,
    featured: true,
  },
  {
    id: 'web3-toolkit',
    title: 'Web3 Automation Toolkit',
    description:
      'Personal tooling for wallet monitoring, multi-chain read operations, and Telegram-delivered alerts.',
    image: '/covers/web3-toolkit.svg',
    imageKind: 'concept',
    imageAlt: 'Web3 automation toolkit module layout visualisation',
    category: 'Infrastructure',
    status: 'PRIVATE',
    origin: 'private',
    statusNote: 'Personal tooling, source not public',
    tech: ['Python', 'Node.js', 'Docker', 'Web3.py', 'Telegram'],
    github: null,
    demo: null,
    caseStudy: '/projects/web3-toolkit',
    verified: false,
  },
  {
    id: 'contract-auditor',
    title: 'Smart Contract Auditor',
    description:
      'Analysis pipeline that runs static analysis over Solidity sources and groups findings into a reviewable report.',
    image: '/covers/contract-auditor.svg',
    imageKind: 'concept',
    imageAlt: 'Smart contract analysis pipeline visualisation',
    category: 'Security',
    status: 'PROTOTYPE',
    origin: 'original',
    statusNote: 'In development, not released',
    tech: ['Solidity', 'Foundry', 'TypeScript', 'Slither'],
    github: null,
    demo: null,
    caseStudy: '/projects/contract-auditor',
    verified: false,
  },
  {
    id: 'intel-dashboard',
    title: 'Blockchain Intelligence Dashboard',
    description:
      'Interface over on-chain activity: address monitoring, transaction views, and charting on top of indexed data.',
    image: '/covers/intel-dashboard.svg',
    imageKind: 'concept',
    imageAlt: 'Blockchain intelligence dashboard interface concept',
    category: 'Analytics',
    status: 'PROTOTYPE',
    origin: 'original',
    statusNote: 'Local build, not publicly deployed',
    tech: ['React', 'Next.js', 'Chart.js', 'Node.js', 'Ethers.js'],
    github: null,
    demo: null,
    caseStudy: '/projects/intel-dashboard',
    verified: false,
  },
];

export const services: Service[] = [
  {
    title: 'AI Agent Development',
    description:
      'Autonomous agents that reason, plan, execute tools, hold memory, and orchestrate multi-step workflows.',
    icon: Bot,
    features: ['Reasoning & planning', 'Tool execution', 'Workflow orchestration'],
  },
  {
    title: 'Blockchain Security',
    description:
      'Smart contract audits, exploit research, vulnerability analysis, and security architecture review.',
    icon: ShieldCheck,
    features: ['Contract audits', 'Exploit research', 'Security architecture'],
  },
  {
    title: 'Web3 Infrastructure',
    description:
      'RPC layers, wallet integrations, backend APIs, indexers, and the automation that ties them together.',
    icon: Boxes,
    features: ['RPC & indexers', 'Wallet integrations', 'Backend APIs'],
  },
  {
    title: 'Cloud Engineering',
    description:
      'Containerized, observable deployments on Linux and AWS with pipelines built to ship safely.',
    icon: Cloud,
    features: ['Docker & AWS', 'Nginx & Linux', 'CI/CD & monitoring'],
  },
  {
    title: 'Security Research',
    description:
      'Blockchain intelligence, wallet investigation, protocol analysis, and on-chain forensics.',
    icon: Search,
    features: ['Wallet investigation', 'Protocol analysis', 'On-chain forensics'],
  },
  {
    title: 'Automation Systems',
    description:
      'Telegram and Discord bots, browser automation, AI workflows, and backend job orchestration.',
    icon: Workflow,
    features: ['Telegram & Discord bots', 'Browser automation', 'AI workflows'],
  },
];

/**
 * The stack, grouped into one premium card per category. This is the single
 * source of truth for technology names — the Tech Stack section and the About
 * orbit both read from here, so a tool is added or renamed in one place.
 */
export const techGroups: TechGroup[] = [
  {
    category: 'Languages',
    items: [
      { name: 'Python', href: 'https://docs.python.org/3/' },
      { name: 'TypeScript', href: 'https://www.typescriptlang.org/docs/' },
      {
        name: 'JavaScript',
        href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      },
      { name: 'Solidity', href: 'https://docs.soliditylang.org/' },
      { name: 'Rust', href: 'https://doc.rust-lang.org/book/' },
      { name: 'Bash', href: 'https://www.gnu.org/software/bash/manual/' },
    ],
  },
  {
    category: 'Frontend',
    items: [
      { name: 'Next.js', href: 'https://nextjs.org/docs' },
      { name: 'React', href: 'https://react.dev/' },
      { name: 'Tailwind CSS', href: 'https://tailwindcss.com/docs' },
      { name: 'Framer Motion', href: 'https://motion.dev/docs' },
    ],
  },
  {
    category: 'Backend',
    items: [
      { name: 'Node.js', href: 'https://nodejs.org/docs/latest/api/' },
      { name: 'FastAPI', href: 'https://fastapi.tiangolo.com/' },
      { name: 'PostgreSQL', href: 'https://www.postgresql.org/docs/' },
      { name: 'Redis', href: 'https://redis.io/docs/latest/' },
      { name: 'SQLite', href: 'https://www.sqlite.org/docs.html' },
    ],
  },
  {
    category: 'Cloud & DevOps',
    items: [
      { name: 'Docker', href: 'https://docs.docker.com/' },
      { name: 'AWS', href: 'https://docs.aws.amazon.com/' },
      { name: 'Linux', href: 'https://www.kernel.org/doc/html/latest/' },
      { name: 'Nginx', href: 'https://nginx.org/en/docs/' },
      { name: 'GitHub Actions', href: 'https://docs.github.com/en/actions' },
    ],
  },
  {
    category: 'AI',
    items: [
      { name: 'OpenAI', href: 'https://platform.openai.com/docs' },
      { name: 'Claude', href: 'https://docs.anthropic.com/' },
      { name: 'Gemini', href: 'https://ai.google.dev/gemini-api/docs' },
      { name: 'OpenRouter', href: 'https://openrouter.ai/docs' },
      { name: 'LangChain', href: 'https://python.langchain.com/docs/' },
    ],
  },
  {
    category: 'Blockchain',
    items: [
      { name: 'Ethereum', href: 'https://ethereum.org/en/developers/docs/' },
      { name: 'Base', href: 'https://docs.base.org/' },
      { name: 'BNB Chain', href: 'https://docs.bnbchain.org/' },
      { name: 'Solana', href: 'https://solana.com/docs' },
      { name: 'Foundry', href: 'https://book.getfoundry.sh/' },
      { name: 'Ethers.js', href: 'https://docs.ethers.org/' },
    ],
  },
];

/**
 * Proof of Work — publicly checkable evidence only.
 *
 * This section exists so a stranger can verify the claims elsewhere on the page,
 * which means every entry must resolve to something real. The list is short on
 * purpose: these four destinations are what is actually public right now. Add to
 * it as repositories and deployments go live; do not pad it in the meantime,
 * because a padded proof section undermines exactly what it is meant to prove.
 *
 * Two consequences of that rule, both learned the hard way here:
 *
 * 1. No entry may point at this site. One used to — `bandidoz.xyz`, described as
 *    "Personal site and writing" — and proving the page to someone already on
 *    the page proves nothing. It also claimed writing that does not exist yet;
 *    every entry in `blogPosts` is still `published: false`.
 * 2. Destinations have to be re-checked, not assumed. That same entry kept its
 *    place in the list long after its host stopped answering on 443, so the one
 *    section built to survive a stranger's scrutiny was shipping a dead link.
 */
export const proofOfWork: ProofItem[] = [
  {
    label: 'GitHub',
    description:
      'Public activity and repositories. Most project work is in private repos, so what is visible here is a subset.',
    href: 'https://github.com/Ineu02',
    icon: Github,
  },
  {
    label: 'LinkedIn',
    description: 'Professional profile and background.',
    href: 'https://www.linkedin.com/in/bandidoz-x-904720240/',
    icon: Linkedin,
  },
  {
    label: 'X',
    description: 'Notes on security research and AI engineering as I work.',
    href: 'https://x.com/maxwelxyz',
    icon: Twitter,
  },
  {
    label: 'Telegram',
    description: 'Direct contact for project and research conversations.',
    href: 'https://t.me/chandrairawa',
    icon: Send,
  },
];

/**
 * Testimonials — intentionally empty.
 *
 * This array previously held three "illustrative" entries: invented names,
 * roles, companies, and five-star ratings. Labelling a quote as a sample does
 * not stop it working as social proof, and a rating nobody gave is a fabricated
 * number. The carousel component was removed along with them.
 *
 * To bring the section back: add real entries here (with the person's
 * permission, quoting what they actually said) and rebuild a component that
 * renders them. The `Testimonial` type is still defined in `@/types`.
 */
export const testimonials: Testimonial[] = [];

/**
 * Blog posts.
 *
 * None of these are written yet, so none has an `href` and every card renders
 * unlinked with a "Publishing soon" tag. The `date` field was removed from the
 * type for drafts: dates implied these were already published. `readTime` is
 * likewise gone — you cannot estimate reading time for unwritten text.
 *
 * To publish: write the article, add a real `href`, and set `published: true`.
 */
export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    title: 'Smart Contract Security Best Practices',
    excerpt:
      'The checks that catch the most bugs before an audit: invariant tests, access-control review, and reasoning about external calls.',
    image: '/covers/security-research.svg',
    imageAlt: 'Smart contract security research artwork',
    category: 'Security',
    published: false,
  },
  {
    id: 'b2',
    title: 'AI Agents in Web3',
    excerpt:
      'Where autonomous agents genuinely help on-chain, where they add risk, and how to bound what an agent is allowed to sign.',
    image: '/covers/hermes.svg',
    imageAlt: 'AI agent architecture artwork',
    category: 'AI',
    published: false,
  },
  {
    id: 'b3',
    title: 'Understanding MEV',
    excerpt:
      'How ordering value is extracted, what sandwiching and backrunning look like in the mempool, and the protections available today.',
    image: '/covers/intel-dashboard.svg',
    imageAlt: 'On-chain analytics artwork',
    category: 'Research',
    published: false,
  },
  {
    id: 'b4',
    title: 'Building Autonomous AI Systems',
    excerpt:
      'Memory, planning loops, tool execution, and failure handling — the parts of an agent that decide whether it survives production.',
    image: '/covers/9router.svg',
    imageAlt: 'LLM routing architecture artwork',
    category: 'AI',
    published: false,
  },
  {
    id: 'b5',
    title: 'Blockchain Infrastructure at Scale',
    excerpt:
      'RPC fan-out, indexer lag, and reorg handling: the operational realities of running Web3 backends under load.',
    image: '/covers/web3-toolkit.svg',
    imageAlt: 'Web3 automation tooling artwork',
    category: 'Infrastructure',
    published: false,
  },
];
