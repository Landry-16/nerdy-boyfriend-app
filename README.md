# Nous

Nous is a private progressive web app for a couple: a shared space for daily
messages, mood tracking, and the moments worth counting. The full product
concept lives in [Nous-Concept.md](Nous-Concept.md).

This repository implements Phase 1 (home dashboard, message of the day, day
counter, mood tracking, navigation) and part of Phase 2 of the roadmap:
memories (souvenirs) and the map. The garden is not built yet. It also
implements individual accounts that pair up into a couple (see
"Authentication and pairing" below), replacing the original single
shared-login model.

## Stack

- React + TypeScript, built with Vite
- Tailwind CSS v4 for styling
- Supabase (Postgres + Auth + Storage) as the backend
- Leaflet / react-leaflet with OpenStreetMap tiles for the map
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
    memories/
    map/
    pairing/
    room/
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

Or paste the contents of each file under `supabase/migrations/`, in order
(`0001_init.sql`, `0002_memories.sql`, `0003_couples.sql`, `0005_room.sql`),
and optionally `supabase/seed.sql`, into the Supabase SQL editor.

No manual account setup needed: each person creates their own account from
the app's sign-up screen (see "Authentication" below).

**Local development without a hosted project:** `npx supabase start` runs
the full stack (Postgres, Auth, Storage) in Docker and applies every
migration and the seed automatically. Point `.env` at the printed API URL
and `publishable`/`anon` key instead of a hosted project's. Useful for
trying out schema changes without touching real data. `npx supabase stop`
shuts it down.

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

## Authentication and pairing

Each person has their own Supabase Auth account. Two accounts pair up into a
**couple** using a short invite code:

1. The first person signs up and creates a couple (`create_couple()`), which
   generates a 6-character invite code.
2. They share that code with their partner (text, call, however).
3. The partner signs up and enters the code (`join_couple_by_code(code)`) to
   join.

Both functions live in `0003_couples.sql`, run with elevated privileges
(`security definer`), and enforce the two business rules that matter here —
you can only be in one couple, and a couple has at most 2 members — entirely
server-side, so a buggy or malicious client cannot bypass them. Until both
people have joined, the app shows a waiting screen with the invite code
(`src/modules/pairing/`).

**Data isolation:** every table is scoped to `couple_id`, and every Row Level
Security policy filters on it (`couple_id = public.current_couple_id()`).
This is the reason the pairing model exists in the schema at all: with
multiple couples now sharing the same Supabase project, RLS has to keep them
from seeing each other's data, not just gate on "signed in". `created_by`
columns record who did what within a couple (not used for access control),
laying groundwork for attribution in future features (messaging,
personalized popups).

If you have existing data from before this change (single shared login), the
migration attaches it to a "legacy" couple; whoever signs up and creates a
couple first should be the person who then re-enters the relevant details
(or you can manually update that legacy couple's row to point at the new
couple in the SQL editor).

## Data model

See `supabase/migrations/` for the source of truth. Summary:

- `couples`: one row per couple, holding the invite code
- `profiles`: one row per user (auto-created on signup via a trigger),
  linking to a couple once paired
- `messages`: the pool of daily messages (compliments, memories, quotes,
  jokes, encouragements, declarations)
- `moods`: one mood entry per calendar day, per couple
- `events`: important dates, optionally recurring yearly
- `couple_settings`: one row per couple, holding the relationship start date
  used by the day counter
- `memories`: souvenirs (title, date, description, optional location name and
  coordinates, optional music link)
- `memory_photos`: one or more photos per memory, stored in the
  `memory-photos` Supabase Storage bucket (public, but paths are random
  UUIDs, so effectively unguessable; upload/delete is still restricted to the
  owning couple)
- `browse_room`: one row per couple, holding the URL currently shown in the
  shared browsing room

`couple_id` and `created_by` are stamped automatically on insert via column
defaults (`public.current_couple_id()` and `auth.uid()`), so application code
never sets them explicitly.

### Shared room

`/room` (`src/modules/room/`) is a single page both partners can point at the
same URL, kept in sync live via Supabase Realtime (`postgres_changes` on
`browse_room`, added to the `supabase_realtime` publication in
`0005_room.sql`) rather than polling. Either partner can navigate; there is
no lock or turn order.

This is a **best-effort** feature, worth understanding before relying on it:
the page is displayed in an iframe, and most sites - every video streaming
platform in particular (YouTube, Crunchyroll, Netflix...) - explicitly
refuse to be framed via `X-Frame-Options` or a `frame-ancestors` Content
Security Policy. This is enforced by the browser itself; page JavaScript has
no reliable way to detect it (no `onerror` fires for a framing refusal, the
frame just renders blank or shows the browser's own refusal page), so the
app does not try to. Instead it always shows an "open in a new tab" link
next to the iframe as the fallback. General websites without such
restrictions (many blogs, wikis, smaller sites) work fine embedded.

`normalizeUrl` (`src/modules/room/normalizeUrl.ts`) only accepts input with
no scheme (prefixed with `https://`) or an explicit `http(s)://` scheme;
anything else (`javascript:`, `ftp:`, `mailto:`...) is rejected rather than
coerced, since blindly prepending `https://` to a non-http(s) scheme
produces a malformed-but-parseable URL instead of the rejection that input
deserves.

### Map

The map (`/map`) is not backed by its own table: it plots every memory that
has latitude/longitude set. Coordinates are captured by tapping a small
Leaflet map in the "new memory" form (`src/modules/memories/LocationPicker.tsx`);
there is no geocoding step, which keeps the app free of any third-party API
key. Memories without coordinates simply do not appear on the map.

### Quick access grid

Modules that are not already surfaced on the home screen (unlike messages,
mood, and the counter, which have their own cards) get a small cute icon tile
instead, added to the list in `src/modules/home/QuickAccessGrid.tsx`. New
modules should extend that list rather than growing the bottom navigation.

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
hosting platform. `vercel.json` rewrites every path to `index.html`, which
client-side routes (React Router) need to work on deep links and refresh.

### Vercel

1. Push this repository to GitHub (already done if you are reading this from
   the repo).
2. On [vercel.com](https://vercel.com), sign in with GitHub, then
   "Add New... > Project" and import this repository. Vercel auto-detects the
   Vite framework preset (`npm run build`, output directory `dist`) with no
   extra configuration needed.
3. Before the first deploy, add the environment variables under
   "Environment Variables": `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   Use the **anon/publishable** key from Supabase (Project Settings > API
   Keys), never the secret key: the secret key must never reach the browser,
   and Supabase itself rejects it client-side.
4. Deploy. Every future push to `main` redeploys automatically.

## Roadmap

Phase 1: home, message of the day, counter, mood, navigation. Phase 2
(partial): memories gallery and map. Beyond the original concept: individual
accounts + couple pairing, and a shared browsing room (this branch). Not yet
built: the garden, the food picker, and further polish (Phases 2 remainder,
3, 4). See [Nous-Concept.md](Nous-Concept.md) for the full original plan.
