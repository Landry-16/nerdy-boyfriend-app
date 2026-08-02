# Nous

Nous is a private progressive web app for a couple: a shared space for daily
messages, mood tracking, and the moments worth counting. The full product
concept lives in [Nous-Concept.md](Nous-Concept.md).

This repository currently implements Phase 1 of the roadmap: home dashboard,
message of the day, day counter, mood tracking, and navigation.

## Stack

- React + TypeScript, built with Vite
- Tailwind CSS v4 for styling
- Supabase (Postgres + Auth) as the backend
- `vite-plugin-pwa` for offline support and installability
- React Router for navigation

## Project structure

```
src/
  App.tsx          routes and top-level providers
  components/      shared UI building blocks (Card, BottomNav, layout...)
  lib/             framework-agnostic helpers (dates, Supabase client, hooks)
  modules/         one folder per feature, self-contained
    auth/
    home/
    messages/
    mood/
    counter/
  types/           shared TypeScript types, including the Supabase schema

supabase/
  migrations/      SQL migrations, applied in order
  seed.sql         example seed data
```

Each module owns its own API calls, components, and page. Shared code only
moves into `lib/` or `components/` once more than one module needs it.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

Create a free project at [supabase.com](https://supabase.com), then apply the
schema:

```bash
npx supabase db push --db-url <your-connection-string>
```

Or paste the contents of `supabase/migrations/0001_init.sql` (and optionally
`supabase/seed.sql`) into the Supabase SQL editor.

Create one Supabase Auth user (email and password) for the couple to share
(see "Authentication" below).

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase
project settings ("API" section).

### 4. Run the app

```bash
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint |
| `npm run generate-icons` | Regenerate PWA icons from `scripts/icon-source.svg` |

## Authentication

The app uses a single shared Supabase Auth account for the couple rather than
per-person accounts. This keeps the MVP simple: no invite flow, no account
linking. Both partners log in with the same email and password. Per-person
accounts are listed as a possible future improvement once the app needs to
distinguish who did what.

## Data model

See `supabase/migrations/0001_init.sql` for the source of truth. Summary:

- `messages`: the pool of daily messages (compliments, memories, quotes,
  jokes, encouragements, declarations)
- `moods`: one mood entry per calendar day
- `events`: important dates, optionally recurring yearly
- `couple_settings`: a single row holding the relationship start date used by
  the day counter

Row Level Security is enabled on every table, restricted to authenticated
requests (see "Authentication" above for what that means in practice).

### Message of the day rotation

Messages are shown one per day, deterministically, with no repeats until every
message has been shown once (see `src/modules/messages/dailyMessage.ts`).
Days are grouped into cycles the length of the message pool; each cycle is an
independent seeded shuffle, so the order changes cycle to cycle while still
guaranteeing full coverage before anything repeats.

## Deploying

The app builds to static files (`npm run build` outputs to `dist/`), so it can
be hosted on any static host that supports PWAs (Vercel, Netlify, Cloudflare
Pages...). Set the same environment variables as in `.env.example` on the
hosting platform.

## Roadmap

Phase 1 (this repository): home, message of the day, counter, mood,
navigation. Phases 2 to 4 (memories gallery, map, garden, food picker, and
further polish) are described in [Nous-Concept.md](Nous-Concept.md).
