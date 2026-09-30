# Contributing to Nexo

## Local setup

Use Node.js 22 and install the lockfile exactly:

```bash
npm ci
npm run dev
```

Nexo runs in local-only mode when both Supabase variables are absent. Copy `.env.example` to `.env`
only when cloud authentication and synchronization are required. Never commit an `.env` file.

## Before opening a pull request

```bash
npm audit --audit-level=moderate
npm run check
```

Keep commits focused and use conventional prefixes such as `feat:`, `fix:`, `refactor:`, `test:`,
`docs:`, and `chore:`. Database migrations and shared-contract changes must be reviewed together
with the frontend or service code that consumes them.

## Architecture rules

- Add shared network payloads to `@nexo/contracts` and validate them at runtime.
- Keep browser-only UI state in the frontend; do not place it in API contracts.
- Do not import database models into the frontend.
- Preserve guest/account storage isolation and idempotent synchronization behavior.
- Add tests for conflict resolution, authentication boundaries, and destructive operations.
