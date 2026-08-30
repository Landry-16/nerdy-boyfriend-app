# Nous

This is a little app I'm building for my girlfriend, mostly just to make her smile. No grand plan, no roadmap, no deadlines, it grows whenever I get a silly new idea at 1am. Some weeks it gets three new features, some months it gets nothing. That's the whole vibe.

It's a PWA (installable on your phone, works offline-ish), private, just the two of us using it.

## What's actually in it right now

- **Home** : the landing screen: today's message, a quick counter summary, shortcuts to everything else, and a little "petit mot" card if your partner left you something
- **Message of the day** : a pool of messages (compliments, memories, jokes, whatever) that rotates one a day without repeating until you've seen them all
- **Compteur** : how many days you've been together, upcoming events, add your own (birthdays, anniversaries, trips...)
- **Humeur** : each person logs their own mood for the day, shown in a little calendar with a colored dot per person so you can tell who felt what, plus an optional note
- **Souvenirs** : a photo gallery/timeline of memories: title, date, photos, optional location and a music link
- **Carte** : every souvenir that has a location shows up as a pin on a map
- **Petit mot** : leave a text or a doodle for your partner, it pops up on their home screen next time they open the app
- **Room** : paste a link and browse it together in sync, live. Heads up: most streaming sites (YouTube, Netflix, Crunchyroll...) refuse to be embedded like this, it's a browser-level thing nobody can hack around, so it mostly works well for regular websites. There's always an "open in a new tab" fallback
- **On mange quoi ?** : random food-type picker (sushi, pizza, burger, whatever you've got) with "encore" and "effacer" buttons, add your own types, and it can suggest actual nearby places for that cuisine
- **Watchlist** : a shared list of movies to watch, same random-pick idea with "encore"/"effacer", and if you add a TMDb key it pulls posters and info automatically when you search
- **Push notifications** : get pinged when your partner leaves a note, adds a memory, adds an event, or when an event is coming up / today
- **Accounts** : each of you has your own login, and you pair up with a short invite code to form a "couple". Everything above is scoped to your couple only

## Stack, briefly

React + TypeScript + Vite, Tailwind for styling, Supabase for literally everything backend (Postgres, auth, storage, realtime, edge functions), Leaflet + OpenStreetMap for maps/places (free, no API key drama), TMDb for movie info (free key, optional). No paid services required to run this.

## Running it yourself

```bash
npm install
cp .env.example .env
```

Then:

1. Make a free [Supabase](https://supabase.com) project
2. Run everything in `supabase/migrations/` in order (paste each file into the Supabase SQL editor, `0001` through the highest number you see)
3. Fill in `.env` with your Supabase URL/anon key (Project Settings > API)
4. `npm run dev`

Each person creates their own account from the sign-up screen, then one of you taps "créer notre couple" to get an invite code and shares it with the other.

Optional env vars, both totally skippable (things just degrade gracefully without them):
- `VITE_VAPID_PUBLIC_KEY` : needed for push notifications, see the Push notifications section further down for the full setup (it's a bit involved, Edge Functions and all)
- `VITE_TMDB_API_KEY` : free key from [themoviedb.org](https://www.themoviedb.org), unlocks movie search in the watchlist. Without it you can still add movies, just by typing the title yourself

Want to mess with the database without touching the real one? `npx supabase start` spins up a full local copy (Postgres, auth, storage, the works) in Docker, migrations and all. `npx supabase stop` when you're done.

## Deploying

It's just a static build (`npm run build`), so it runs on Vercel/Netlify/whatever. `vercel.json` is already set up for Vercel specifically (handles the client-side routing). Push to GitHub, import the repo on Vercel, add your env vars there too (separately from your local `.env` : easy to forget), deploy. Every push to `main` after that redeploys on its own.

## Push notifications (the annoying-but-worth-it part)

This one needs actual backend infra, not just a database table: two Supabase Edge Functions (`send-push` and `check-event-reminders`), a VAPID key pair for Web Push, and a daily cron job for the "event coming up / event today" reminders. It's genuinely a few extra steps : deploy the functions, set some secrets, schedule the cron in the SQL editor. Worth it for the "oh they thought of me" notification hit, but don't feel bad if you skip it, the rest of the app works fine without it.

## A note on data

Everything's private to your couple : nobody else using this code (if anyone ever did) could see your stuff, that's enforced at the database level, not just hidden in the UI. No ads, no analytics, no tracking, no third party ever sees your data except Supabase (hosting it) and, for the two optional bits, OpenStreetMap (place lookups) and TMDb (movie posters).

That's it. If you're reading this because you cloned it for your own person: hope it makes them smile too.
