import type { ProjectDetail } from '@/types';

/**
 * Long-form case-study prose, keyed by project id.
 *
 * WHY IT IS NOT IN `data.ts`: the project grid on the home page is a client
 * component, so everything in the `projects` array is compiled into the
 * browser bundle. These six fields are read only by `/projects/[slug]`, which
 * is a server component — keeping them in a module no client component imports
 * means ~9 KB of prose is rendered into the case study's HTML and never shipped
 * as JavaScript to a visitor who only reads the home page.
 *
 * Every key here must match a `projects` entry id; the detail route looks the
 * record up by id and 404s on a miss, so a typo cannot ship a half-built page.
 */
export const projectDetails: Record<string, ProjectDetail> = {
  'hermes': {
    overview:
      'Hermes is an agent runtime built around a single idea: an agent is only useful in production if it can remember what it did, recover when a tool fails, and be driven from wherever you already are. It runs as a long-lived service and is operated conversationally through Telegram.',
    problem:
      'A raw LLM call forgets everything between requests and has no way to act. Wiring one into a chat interface gets you a demo, not a system: there is no memory across sessions, no retry path when a tool errors, and a single provider outage takes the whole thing down.',
    solution:
      'A planning loop sits between the model and its tools. Each turn is persisted to SQLite so context survives restarts, tool calls are dispatched through a registry with explicit schemas, and provider selection sits behind an abstraction so Claude, Gemini, and OpenRouter are interchangeable at runtime.',
    architecture:
      'A FastAPI service exposes the agent over HTTP and receives Telegram webhooks. The reasoning loop, tool registry, and provider adapters are separate modules, so a new tool or provider is added without touching the loop. State lives in SQLite; the whole service is containerised for deployment.',
    features: [
      'Persistent conversation memory across restarts',
      'Tool registry with typed schemas and validated arguments',
      'Multi-provider reasoning with runtime provider selection',
      'Telegram as the operator interface',
      'Structured error handling with retry and fallback paths',
      'Containerised single-service deployment',
    ],
    currentStatus:
      'Running privately. The source is not public and there is no hosted demo, so there is nothing to link here yet — the architecture description above is what I can share.',
  },
  '9router': {
    overview:
      'A routing layer that sits in front of several LLM providers and exposes one interface to callers. Applications ask for a capability rather than naming a vendor, and the router decides where the request goes.',
    problem:
      'Provider SDKs disagree on request shape, streaming format, and error semantics, so switching vendors means touching every call site. Rate limits and outages hit without warning, and a hard-coded provider means an outage upstream becomes an outage in your product.',
    solution:
      'One normalised request and response schema, with per-provider adapters translating in and out. Provider health is tracked in Redis so a failing upstream is skipped rather than retried blindly, and requests fall back through a preference order until one succeeds.',
    architecture:
      'A Node service handles routing; adapters isolate provider quirks; Redis holds health state and cached responses so repeat prompts avoid a paid round trip. A Next.js dashboard reads that state. Everything runs in containers.',
    features: [
      'Single normalised API across multiple providers',
      'Health-aware routing that skips failing upstreams',
      'Ordered failover across the provider list',
      'Response caching in Redis to avoid repeat calls',
      'Streaming passthrough with a consistent event shape',
      'Dashboard over live routing state',
    ],
    currentStatus:
      'A working prototype I run locally. It is not deployed publicly and the repository is private, so there is no link to offer yet.',
  },
  'security-research': {
    overview:
      'A standing body of work rather than a shipped product: reading contracts, reproducing known exploit classes in tests, and building a personal catalogue of the patterns that keep recurring.',
    problem:
      'Vulnerability write-ups explain what went wrong after the fact, but reading a post-mortem is not the same as understanding the bug well enough to spot it in unfamiliar code. The gap closes only by reproducing the failure yourself.',
    solution:
      'Each pattern studied gets a minimal Foundry reproduction — a contract exhibiting the flaw and a test that exploits it. Static analysis with Slither runs first to see what tooling catches, which makes the residue that tooling misses the interesting part.',
    architecture:
      'A Foundry workspace of isolated case directories, one per vulnerability class, each with the vulnerable contract, an exploit test, and notes on the root cause and its fix. Python scripts drive batch analysis across the set.',
    features: [
      'Reproductions of reentrancy, access-control, and oracle-manipulation classes',
      'Notes tracing each bug to its root cause and remediation',
      'Slither baselines showing what static analysis does and does not catch',
      'Comparison of the same flaw across Solidity versions',
    ],
    currentStatus:
      'Ongoing private research. No findings are published and no public repository exists, so nothing here should be read as a disclosed vulnerability or a completed audit.',
  },
  'web3-toolkit': {
    overview:
      'A collection of scripts and small services I built for my own use: watching addresses across chains, normalising what comes back, and pushing anything noteworthy to Telegram.',
    problem:
      'Watching activity across several chains by hand does not scale. Each chain exposes a different RPC surface, block explorers rate-limit aggressive polling, and the interesting events are buried in routine ones.',
    solution:
      'A polling layer per chain normalises responses into one internal event shape, filters run over that stream to decide what matters, and matches are delivered to Telegram. Adding a chain means adding an adapter, not a new pipeline.',
    architecture:
      'Python workers poll RPC endpoints on a schedule and write normalised events to a local store. A filter layer evaluates rules against the stream; a small Node service handles Telegram delivery. Components run as separate containers.',
    features: [
      'Address monitoring across multiple EVM chains',
      'Normalised event shape across differing RPC responses',
      'Rule-based filtering for alert-worthy activity',
      'Telegram notification delivery',
      'Backoff and retry against rate-limited endpoints',
    ],
    currentStatus:
      'Private tooling built for my own workflow. Not packaged for release and not open source, so there is no repository to link.',
  },
  'contract-auditor': {
    overview:
      'Tooling that automates the mechanical first pass of a contract review, so manual attention goes to the findings that need judgement rather than to running the same commands each time.',
    problem:
      'The opening hours of a review are repetitive: run the analysers, dedupe overlapping findings, sort by severity, and discard the noise. Doing this by hand every time is slow and easy to do inconsistently.',
    solution:
      'A pipeline that compiles the target, runs Slither, and normalises findings into one schema. Overlapping detections collapse into a single entry, results group by severity and affected contract, and output is a structured report rather than raw tool logs.',
    architecture:
      'A TypeScript orchestrator drives compilation and analysis as discrete stages. Each analyser has an adapter emitting the shared finding schema, so adding a tool does not change the reporting layer. Foundry handles compilation and test execution.',
    features: [
      'Automated compile-and-analyse pipeline',
      'Normalised finding schema across analysers',
      'Deduplication of overlapping detections',
      'Grouping by severity and affected contract',
      'Structured report output for review',
    ],
    currentStatus:
      'Under active development and not released. To be explicit: this is tooling that assists a review — it has not been used to produce any published audit, and no findings from it are disclosed anywhere.',
  },
  'intel-dashboard': {
    overview:
      'A front end over the monitoring work: rather than reading alerts as they arrive, this presents address activity over time with the context needed to tell routine movement from unusual movement.',
    problem:
      'Raw transaction lists are hard to reason about. Block explorers answer "what happened in this transaction" well, but not "how does this address usually behave, and is today different".',
    solution:
      'An indexing layer pulls history for watched addresses into local storage, and the interface renders it as time series and activity summaries. Reads hit the local index rather than an RPC endpoint, so exploration is fast and does not exhaust rate limits.',
    architecture:
      'A Node indexer fetches and stores history via Ethers.js. A Next.js app queries that store and renders with Chart.js. Indexing and presentation are separate, so the interface never waits on a chain round trip.',
    features: [
      'Address activity over time',
      'Transaction history from a local index',
      'Charted volume and frequency views',
      'Multi-address watchlists',
      'Local indexing to avoid repeated RPC calls',
    ],
    currentStatus:
      'A prototype running locally against my own watchlist. Not deployed publicly and the repository is private. The cover image is concept artwork, not a screenshot of a live product.',
  },
};
