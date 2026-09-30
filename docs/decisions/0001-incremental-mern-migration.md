# ADR 0001: Migrate to MERN incrementally

- Status: Accepted
- Date: 2026-10-01

## Context

Nexo already has a mature React interface and local-first synchronization behavior. Replacing the
entire data layer at once would mix UI risk, authentication risk, and data-migration risk in one
release. It would also remove the ability to compare the existing and replacement backends.

## Decision

Nexo will introduce a shared runtime contract package first, then add a TypeScript Express API and
MongoDB through vertical feature slices. Supabase remains available until MongoDB supports the same
authentication, Notes, Tasks, Focus, sharing, and synchronization behavior.

Frontend features will access persistence through repository interfaces. During migration, those
interfaces may be backed by local storage, Supabase, or the Express API. Direct Supabase imports are
removed only after API parity and data migration are verified.

## Consequences

### Positive

- The UI remains reviewable and deployable after every phase.
- Shared Zod schemas prevent frontend/backend payload drift.
- Migration can be tested with a small user cohort before cutover.
- Rollback remains possible until the final Supabase retirement.

### Trade-offs

- Two cloud adapters temporarily coexist.
- Synchronization tests must run against both implementations.
- The final migration includes a deliberate data export/import and verification step.
