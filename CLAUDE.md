# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install                  # Install dependencies
bun run dev                  # Dev server on port 3000
bun run build                # Production build
bun run test                 # Unit tests (Vitest)
bun run e2e                  # E2E tests (Playwright)
bun run e2e:ui               # Playwright UI mode
bun run e2e:headed           # Playwright with visible browser
bun run e2e:report           # Open Playwright HTML report
bun run check                # Biome lint + format validation
bun run format --write       # Auto-fix formatting
bun run deploy               # Build + deploy to Cloudflare Workers
bun run preview              # Serve production build locally
bun run start                # Start production server (requires prior build)
```

Pre-commit hook runs `biome check` on staged files via Husky + lint-staged. If a commit is blocked, run `bun run format --write`, re-stage, and commit again.

## Architecture

**TanStack Start** full-stack React app with SSR, file-based routing, and Cloudflare Workers deployment.

- `src/routes/` — File-based routes (TanStack Router). Adding a file here auto-registers a route.
- `src/routes/__root.tsx` — App shell/layout, wraps content with `WorkOSProvider`.
- `src/router.tsx` — Router creation + Sentry client initialization.
- `instrument.server.mjs` — Sentry server-side initialization (copied to dist on build).
- `src/env.ts` — T3Env environment variable validation (Zod schemas). Import `env` from `@/env` instead of reading `process.env` or `import.meta.env` directly.
- `src/routeTree.gen.ts` — **Auto-generated, never edit manually.**
- `src/components/` — React components.
- `src/hooks/` — Custom React hooks.
- `src/integrations/` — Third-party service integrations (WorkOS auth).
- `tests/` — Playwright E2E tests.
- `design/` — Design files (`.pen`) and generated images. Not part of the build.

**Key integrations:**
- **WorkOS AuthKit** for authentication (`src/integrations/workos/provider.tsx`, `src/hooks/useUser.tsx`)
- **Sentry** for error monitoring (client in `router.tsx`, server in `instrument.server.mjs`)
- **Tailwind CSS v4** via Vite plugin
- **shadcn/ui ecosystem** — `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `@base-ui/react`, `@fontsource-variable/geist`

## Conventions

- **Commit messages**: Use [Conventional Commits](https://www.conventionalcommits.org/) format: `type: description`. Common types: `feat`, `fix`, `chore`, `ci`, `docs`, `refactor`, `test`, `perf`. Scope is optional (e.g., `feat(auth): add login`).
- **Git workflow**: Never commit directly to `main`. Always: (1) create a GitHub issue first, (2) create a feature branch from `main`, (3) commit to the feature branch, (4) create a PR if one doesn't already exist. Use `gh` CLI for issue/PR creation.
- Use `createServerFn` from `@tanstack/react-start` for type-safe server functions.
- Wrap meaningful server operations with `Sentry.startSpan()`.
- Import alias: `@/*` maps to `src/*`.
- Biome handles all formatting and linting (no ESLint/Prettier). Tab indentation, double quotes.
- Biome auto-organizes imports — don't manually reorder.
- `src/styles.css` and `src/routeTree.gen.ts` are excluded from Biome.
- `verbatimModuleSyntax` is on — use `import type { Foo }` for type-only imports.
- `noUnusedLocals` and `noUnusedParameters` are enforced in tsconfig.
- `.tsx` extensions in imports are allowed and used (e.g., `import Foo from "./Foo.tsx"`).
- Client-only code (auth, browser SDKs) must use `createClientOnlyFn` or route-level `ssr: false`.
- `lucide-react` for icons, `zod` for validation.
- Demo routes (`src/routes/demo/`) are examples that can be safely deleted.
- Dev scripts use `cross-env` for Windows compatibility. If adding new scripts with env vars, use `cross-env` instead of inline `VAR=value`.

## Gotchas

- **Missing env vars fail at startup** — T3Env validates all required vars on import. If the app crashes immediately, check the Zod error for which var is missing.
- `sentryTanstackStart` must be the **last Vite plugin** in `vite.config.ts`.
- E2E tests run against `http://127.0.0.1:3000` (not `localhost`). Playwright tests all 3 browsers (Chromium, Firefox, WebKit).
- Tailwind v4 syntax: `@import "tailwindcss"` in `src/styles.css` (not `@tailwind` directives).

## Environment Variables

All env vars are validated at startup via T3Env (`src/env.ts`). If any required var is missing, the app fails immediately with a clear Zod error — no need to debug cryptic build failures.

**Required in `.env.local`:**
- `VITE_SENTRY_DSN` — Sentry DSN URL
- `VITE_SENTRY_ORG` — Sentry organization slug
- `VITE_SENTRY_PROJECT` — Sentry project slug
- `VITE_WORKOS_CLIENT_ID` — WorkOS client ID
- `VITE_WORKOS_API_HOSTNAME` — WorkOS API hostname
- `WORKOS_API_KEY` — WorkOS API key (server-only, required for user registration)

**Optional:**
- `SENTRY_AUTH_TOKEN` — Sentry auth token (server-only).
- `VITE_ENVIRONMENT` — Defaults to `"development"`. Set to `"production"` to reduce Sentry server-side sample rate.
- `VITE_APP_TITLE` — Application title override.
- `SERVER_URL` — Server URL (server-only).

Always use `import { env } from "@/env"` to access env vars — never `process.env` or `import.meta.env` directly.
