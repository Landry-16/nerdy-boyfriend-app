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
    notes/
    room/
    notifications/
  sw.ts            custom service worker (push notifications)
  types/           shared TypeScript types, including the Supabase schema

supabase/
  migrations/      SQL migrations, applied in order
  functions/       Edge Functions (Deno), deployed separately from the app
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
(`0001_init.sql` through `0007_push_notifications.sql`), and optionally
`supabase/seed.sql`, into the Supabase SQL editor.

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
migration attaches it to a "legacy" couple (fixed id
`00000000-0000-0000-0000-000000000001`). To keep that history, either:

- sign in with the original shared-login account after applying
  `0006_backfill_profiles.sql` (which gives it a profile, same as any
  fresh signup) and create a couple from there, then share its invite code
  and have your partner join with it; or
- create two fresh individual accounts as usual, and manually link one (or
  both) to the legacy couple in the SQL editor:
  ```sql
  update public.profiles set couple_id = '00000000-0000-0000-0000-000000000001'
  where id = '<the account's auth.users id>';
  ```

Either way works; `0006_backfill_profiles.sql` does not assume which one you
want and leaves the old account's `couple_id` null, same as a brand new
signup.

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
- `notes`: a text message or a small drawing one partner leaves for the
  other; `content` is plain text for `kind = 'text'`, or a PNG data URL for
  `kind = 'drawing'` (small enough that a Storage bucket would be overkill)
- `browse_room`: one row per couple, holding the URL currently shown in the
  shared browsing room
- `push_subscriptions`: one row per device with push notifications enabled
  (endpoint and encryption keys for the Web Push protocol)

`events` additionally has `notified_approaching_at` / `notified_today_at`,
used only to avoid double-sending push reminders (see "Push notifications").

`couple_id` and `created_by` are stamped automatically on insert via column
defaults (`public.current_couple_id()` and `auth.uid()`), so application code
never sets them explicitly.

### Partner notes

Either partner can leave a short message or doodle
(`src/modules/notes/NoteComposerPage.tsx`, reachable from the bottom nav's
"Petit mot" tab). It shows up as a card on the *other* person's home
screen (`PartnerNoteCard.tsx`) the next time they open the app, and stays
there until they dismiss it (`seen_at` gets set). A person never sees their
own note as "from partner" - the query excludes rows where `created_by`
matches the viewer. This is the first feature built on top of the
`created_by` attribution columns added for the couples migration.

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

### Push notifications

Real OS-level push notifications - the kind that reach a phone even when the
app is closed - fire for five triggers: a partner sends a note, adds a
memory, adds an event, an event is `APPROACHING_DAYS` (7) away, and an event
is today. This needs more than the frontend: nothing running only in the
browser tab can wake up days later to check whether an event is approaching.

**Pieces involved:**

- `push_subscriptions` table (`0007_push_notifications.sql`): one row per
  device a user has enabled notifications on. RLS only lets a user read/write
  their *own* rows - their partner's raw push endpoint and keys are not
  couple data - so sending to the partner always goes through the service
  role key in an Edge Function, never the client directly.
- `src/sw.ts`: a hand-written service worker (the PWA plugin runs in
  `injectManifest` mode instead of its default `generateSW` specifically to
  allow this) with `push` and `notificationclick` handlers.
- `src/modules/notifications/`: requests permission, subscribes, and saves
  the subscription. `NotificationPrompt` on the home screen is the entry
  point; it only shows when supported and not already granted/dismissed
  (dismissal is remembered in `localStorage`).
- `supabase/functions/send-push`: called directly by the client right after
  it creates a note, memory, or event (`src/lib/notify.ts`, fire-and-forget -
  a failed push must never block the action that triggered it). Resolves the
  caller's `couple_id` from their own JWT server-side rather than trusting a
  client-supplied value, so a client cannot ask it to notify a couple it
  does not belong to.
- `supabase/functions/check-event-reminders`: scheduled once a day (not
  client-triggered) via `pg_cron`. Checks every event across every couple for
  the "approaching" and "today" triggers, using `notified_approaching_at` /
  `notified_today_at` to avoid double-sending - compared against *today's
  date only*, so a recurring event correctly notifies again next year with
  no extra reset logic.

**Setup, after applying `0007_push_notifications.sql`:**

1. Generate a VAPID key pair (skip if you already have one):
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Client: set `VITE_VAPID_PUBLIC_KEY` to the public key in `.env` (local)
   and in your hosting platform's environment variables (see "Vercel" below).
3. Deploy the two Edge Functions:
   ```bash
   npx supabase functions deploy send-push
   npx supabase functions deploy check-event-reminders
   ```
4. Set their secrets (private key never goes in any committed file or the
   client env):
   ```bash
   npx supabase secrets set VAPID_PUBLIC_KEY=<public key>
   npx supabase secrets set VAPID_PRIVATE_KEY=<private key>
   npx supabase secrets set VAPID_SUBJECT=mailto:you@example.com
   npx supabase secrets set CRON_SECRET=<any random string>
   ```
5. Schedule the daily check in the Supabase SQL editor (`pg_cron` and
   `pg_net` are enabled by default on hosted projects; `<project-ref>` is in
   your project's URL, the service role key is under Project Settings > API):
   ```sql
   select cron.schedule(
     'daily-event-reminders',
     '0 8 * * *', -- 08:00 UTC daily; adjust to taste
     $$
     select net.http_post(
       url := 'https://<project-ref>.supabase.co/functions/v1/check-event-reminders',
       headers := jsonb_build_object(
         'Authorization', 'Bearer <service role key>',
         'x-cron-secret', '<the CRON_SECRET you set above>'
       )
     )
     $$
   );
   ```

Without this setup the app still works; `NotificationPrompt` simply fails
silently to subscribe (no `VITE_VAPID_PUBLIC_KEY`), and `notifyPartner()`
calls fail silently too (no deployed `send-push` function) - by design, per
the "must never block the action that triggered it" rule above.

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
   "Environment Variables": `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   and `VITE_VAPID_PUBLIC_KEY` (see "Push notifications" for that last one).
   Use the **anon/publishable** key from Supabase (Project Settings > API
   Keys), never the secret key: the secret key must never reach the browser,
   and Supabase itself rejects it client-side.
4. Deploy. Every future push to `main` redeploys automatically.

## Roadmap

Phase 1: home, message of the day, counter, mood, navigation. Phase 2
(partial): memories gallery and map. Beyond the original concept: individual
accounts + couple pairing, partner notes/doodles, a shared browsing room, and
push notifications. Not yet built: the garden, the food picker, and further
polish (Phases 2 remainder, 3, 4). See [Nous-Concept.md](Nous-Concept.md) for
the full original plan.
