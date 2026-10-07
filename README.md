# Nexo - Personal Productivity Dashboard

Nexo is a local-first productivity workspace for deep work, notes, tasks, focus sessions, and lightweight knowledge sharing. It is built with React, TypeScript, Vite, Tailwind CSS, Zustand, and optional Supabase auth/sync.

Nexo is being migrated incrementally toward a MERN architecture. The current React application
remains deployable while shared runtime contracts, an Express API, and MongoDB are introduced in
reviewable vertical slices. See [the architecture guide](docs/architecture.md) and
[Phase 1 foundation plan](docs/phase-1-foundation.md).

## Quick Start

### Prerequisites

- Node.js 20.19+
- npm

### Development

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000` by default.

### Production Build

```bash
npm run build
npm run preview
```

### MERN API (local development)

The Express API and MongoDB backend are an opt-in local service; the existing Vite app still runs independently. Supabase workflows are not part of this API startup or build.

```bash
docker compose up -d mongodb
cp apps/api/.env.example apps/api/.env
# Set a private JWT_ACCESS_SECRET in apps/api/.env before starting the API.
npm run dev:api
```

The API listens on `http://localhost:4000`. Liveness and database readiness are available at `/api/v1/health/live` and `/api/v1/health/ready`. Authenticated Notes endpoints are under `/api/v1/notes`; auth endpoints are under `/api/v1/auth`. The [OpenAPI contract](docs/api/openapi.yaml) describes the current routes.

For a production deployment, configure secrets and `CLIENT_ORIGINS` in the hosting provider, then run `npm run db:indexes --workspace @nexo/api` once against the target MongoDB database before serving traffic. Never commit `apps/api/.env` or production credentials.

To build both apps, run `npm run build:all`; the API alone can be type-checked with `npm run typecheck --workspace @nexo/api` and built with `npm run build:api`.

## Features

- Focus timer with session history and activity analytics
- Notes with BlockNote editing, Markdown preview, backlinks, tags, pins, and graph view
- Tasks with priority, due dates, completion state, and task-level focus tracking
- Command palette for navigation and workspace search
- Optional Google sign-in and Supabase cloud sync
- Public read-only note sharing when Supabase is configured
- Local-first persistence through Zustand storage
- PWA update prompt and install-ready manifest
- Light and dark themes

## Project Structure

```text
Nexo/
├── public/                  Static assets
├── packages/contracts/      Shared Zod schemas and inferred domain types
├── apps/api/                 Express 5 + TypeScript + MongoDB API
├── docs/                    Architecture decisions and migration plans
├── src/
│   ├── components/          App screens and UI components
│   ├── components/ui/       Shared UI elements
│   ├── hooks/               Browser and feature hooks
│   ├── lib/                 Supabase client and sync engine
│   ├── store/               Zustand auth, app, and theme stores
│   ├── types/               Shared Note, Task, and Focus types
│   ├── App.tsx              Routes and app shell
│   ├── main.tsx             React entry point
│   └── index.css            Theme and global styles
├── supabase/migrations/     Versioned database schema, RLS, and sync safeguards
├── compose.yaml              Local MongoDB service for API development
├── .github/workflows/ci.yml Frontend type, test, audit, and build checks
├── vercel.json              SPA routing and security headers for Vercel
├── vite.config.ts           Vite, Tailwind, PWA, and test configuration
└── package.json
```

## Data Model

Nexo works without a backend. Notes, tasks, focus sessions, theme settings, and the offline sync queue are stored locally in the browser. Guest and signed-in workspaces use separate account-scoped storage, so changing accounts in one browser cannot expose or upload another workspace's local data.

When Supabase credentials are provided, the app enables:

- Google OAuth sign-in
- Per-user notes, tasks, and focus sessions
- Row Level Security policies
- Realtime updates across devices
- Public read-only note links for notes explicitly marked public

Local edits are optimistic: the UI updates first, then a per-account queue sends changes to Supabase in order. Offline writes retry when the browser returns online. Version and timestamp guards in PostgreSQL reject stale writes from another browser or device, while soft-delete tombstones prevent deleted records from reappearing.

## Supabase Setup

1. Create a Supabase project and install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started).
2. Link this repository and apply the committed migrations:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

3. Enable the desired providers under Authentication. Email/password works without Google; Google OAuth remains optional.
4. Add both the local and production `/profile` URLs to Authentication → URL Configuration → Redirect URLs.
5. Copy `.env.example` to `.env` and add the public project values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

If these values are omitted, cloud sync and sign-in are disabled and Nexo remains local-only.

For a clean local database check, run:

```bash
supabase db start
supabase db reset
supabase db lint --local --fail-on error
```

`supabase/migrations/` is the canonical schema history. Apply migrations before deploying frontend code that depends on new columns or views.

## Deployment

The repository includes Vercel SPA rewrites and a Netlify-compatible `_redirects` fallback, so refreshes on `/notes`, `/profile`, and public `/share/:noteId` links resolve to the React app. Configure the two `VITE_SUPABASE_*` variables in the hosting provider, set the Supabase production Site URL, and add `https://YOUR_DOMAIN/profile` as an allowed redirect.

GitHub Actions currently runs only the frontend audit, TypeScript, tests, and production build for pushes to `main` and pull requests. The Supabase migration job is intentionally paused until the hosted database workflow is enabled; migrations remain versioned and can still be checked locally with the commands above.

## Scripts

```bash
npm run dev        # Start local development server
npm run build      # Build production assets
npm run preview    # Preview the production build
npm run lint       # Enforce TypeScript and React lint rules
npm run format:check # Verify repository formatting
npm test           # Run Vitest
npm run coverage   # Run Vitest with coverage
npm run check      # Run all CI quality gates and production build
```

## Notes

- Cloud data is protected by Supabase authentication and Row Level Security.
- The app does not currently implement end-to-end encryption.
- Public note sharing only works for notes explicitly marked public.
- Run `npm install` after cloning before using the build or test scripts.

## License

MIT
