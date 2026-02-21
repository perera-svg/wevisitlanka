# Project Guidelines

## Build and Test

- Install dependencies with `bun install`.
- Run local development with `bun run dev`.
- Build production assets with `bun run build`.
- Run tests with `bun run test`.
- Lint/format with Biome using `bun run lint`, `bun run check`, and `bun run format`.

## Architecture

- This app uses TanStack Start + React with file-based routing in `src/routes`.
- `src/routes/__root.tsx` defines the app shell and wraps content with `WorkOSProvider`.
- `src/router.tsx` creates the TanStack router and initializes Sentry on the client.
- `instrument.server.mjs` initializes Sentry for the server runtime.
- WorkOS integration lives in `src/integrations/workos/provider.tsx`.

## Conventions

- Do not edit `src/routeTree.gen.ts`; it is auto-generated and overwritten.
- Keep component code in `src/components`, hooks in `src/hooks`, and external service integrations in `src/integrations`.
- Env vars used in the app include:
  - `VITE_SENTRY_DSN`
  - `VITE_ENVIRONMENT`
  - `VITE_WORKOS_CLIENT_ID`
  - `VITE_WORKOS_API_HOSTNAME`
- When adding or changing server functions, prefer adding Sentry spans (`Sentry.startSpan`) around meaningful operations.

## Code Style

- Follow Biome formatting and linting defaults configured in this repo.
- Keep changes focused and consistent with existing patterns in nearby files.
