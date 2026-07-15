# Nexo - Personal Productivity Dashboard

Nexo is a local-first productivity workspace for deep work, notes, tasks, focus sessions, and lightweight knowledge sharing. It is built with React, TypeScript, Vite, Tailwind CSS, Zustand, and optional Supabase auth/sync.

## Quick Start

### Prerequisites

- Node.js 18+
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
├── supabase/schema.sql      Supabase tables, policies, indexes, and realtime setup
├── vite.config.ts           Vite, Tailwind, PWA, and test configuration
└── package.json
```

## Data Model

Nexo works without a backend. Notes, tasks, focus sessions, theme settings, and the offline sync queue are stored locally in the browser.

When Supabase credentials are provided, the app enables:

- Google OAuth sign-in
- Per-user notes, tasks, and focus sessions
- Row Level Security policies
- Realtime updates across devices
- Public read-only note links for notes explicitly marked public

Local edits are optimistic: the UI updates first, then the sync engine pushes changes to Supabase. Offline writes are queued locally and retried when the browser returns online.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Enable Google in Authentication providers.
4. Add your OAuth redirect URL in Supabase.
5. Create a `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

If these values are omitted, cloud sync and sign-in are disabled and Nexo remains local-only.

## Scripts

```bash
npm run dev        # Start local development server
npm run build      # Build production assets
npm run preview    # Preview the production build
npm test           # Run Vitest
npm run coverage   # Run Vitest with coverage
```

## Notes

- Cloud data is protected by Supabase authentication and Row Level Security.
- The app does not currently implement end-to-end encryption.
- Public note sharing only works for notes explicitly marked public.
- Run `npm install` after cloning before using the build or test scripts.

## License

MIT
