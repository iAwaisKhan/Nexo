# Phase 1: Production foundation

Phase 1 is intentionally split into local commits so each day can be reviewed independently before
anything is pushed to `main`.

## Day 1 — Quality and security gates

- Repair dependency vulnerabilities.
- Add ESLint and Prettier enforcement.
- Add Vitest coverage reporting and non-regression thresholds.
- Upload the coverage summary from CI.
- Keep type checking, tests, audit, and production build in one `npm run check` pipeline.

## Day 2 — Shared contracts

- Establish npm workspaces without moving the existing frontend.
- Add `@nexo/contracts` with Zod schemas for Notes, Tasks, Focus Sessions, workspace payloads, and
  public client environment variables.
- Infer frontend domain types from runtime schemas.
- Validate optional Supabase configuration at startup.
- Add contract tests.

## Day 3 — Architecture and cleanup

- Document the current and target MERN architecture.
- Record the incremental migration decision.
- Add repository contribution and security guidance.
- Remove the unreferenced duplicate background video.
- Remove dead unsupported-provider behavior while preserving Google authentication.
- Run the full CI-equivalent pipeline and browser smoke test.

## Exit criteria

- `npm audit --audit-level=moderate` reports zero vulnerabilities.
- `npm run check` succeeds from a clean checkout.
- The current local-only and optional Supabase modes still build.
- Shared contracts contain no database-specific model code.
- The UI remains visually unchanged for manual review.
