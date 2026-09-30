# Nexo Architecture

## Current system

Nexo is a React PWA with a local-first workspace. Zustand owns the active client workspace,
browser storage provides offline persistence, and the sync engine coordinates optional Supabase
cloud synchronization. Account-scoped storage keys and account-scoped write queues prevent one
browser user's data from entering another user's workspace.

```mermaid
flowchart LR
  UI[React PWA] --> Store[Zustand workspace store]
  Store --> Local[(Browser storage)]
  Store --> Sync[Offline sync engine]
  Sync --> Cloud[(Supabase/PostgreSQL)]
  Contracts[@nexo/contracts] --> UI
  Contracts --> Store
  Contracts -. future .-> API[Express API]
```

## Target MERN system

The migration keeps the React PWA and its offline-first behavior. Persistence, authentication,
authorization, public sharing, and synchronization move behind a versioned Express API. MongoDB
becomes the system of record, while the browser remains an optimistic local cache.

```mermaid
flowchart LR
  Web[React PWA] --> Local[(IndexedDB/local cache)]
  Web -->|HTTPS + WebSocket| API[Node.js + Express API]
  API --> Mongo[(MongoDB Atlas)]
  API --> Redis[(Redis / job queue)]
  Worker[Node.js worker] --> Redis
  Worker --> Mongo
  Contracts[@nexo/contracts] --> Web
  Contracts --> API
  Contracts --> Worker
```

## Package boundaries

- `src/`: current React application. It remains deployable throughout the migration.
- `packages/contracts/`: runtime Zod schemas and inferred TypeScript types shared by clients and
  future services.
- `supabase/`: temporary cloud schema and migration history until MongoDB reaches feature parity.
- `docs/`: architecture decisions, operating guidance, and phased migration plans.

## Data ownership rules

1. Every cloud record belongs to exactly one authenticated user.
2. Public sharing uses a narrow read model and never exposes an owner identifier.
3. Client mutations carry an operation identifier, logical version, and modification timestamp.
4. Deletes use tombstones until all known clients have observed them.
5. Replayed mutations must be idempotent.
6. Guest data remains device-local unless the user explicitly imports it into an account.

## Planned service boundaries

The first Express service will expose `/api/v1/health`, authentication endpoints, and Notes CRUD.
Tasks, focus sessions, sharing, sync batching, realtime updates, and background jobs follow only
after the vertical Notes slice is tested end to end.

The frontend must not depend on Mongoose models or database-specific identifiers. All network
payloads cross the `@nexo/contracts` boundary, allowing Supabase and MongoDB adapters to coexist
during migration.

## Quality baseline

Every change must pass:

```bash
npm audit --audit-level=moderate
npm run check
```

`npm run check` enforces linting, formatting, TypeScript, tests with coverage floors, and a
production PWA build. Coverage floors reflect the measured Phase 1 baseline and must only move
upward as integration and browser tests are added.
