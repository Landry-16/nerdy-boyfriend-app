-- Phase 1 schema: daily messages, moods, important events, and the couple's
-- shared settings (relationship start date used by the day counter).
--
-- Access model: the app uses a single shared Supabase Auth account for the
-- couple (see README "Authentication" section), so every table simply
-- requires the caller to be authenticated. There is no per-row ownership.

create extension if not exists pgcrypto;

-- Messages shown one per day on the home screen (see src/modules/messages).
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  type text not null check (
    type in ('compliment', 'memory', 'quote', 'joke', 'encouragement', 'declaration')
  ),
  created_at timestamptz not null default now()
);

-- One mood entry per calendar day.
create table if not exists public.moods (
  id uuid primary key default gen_random_uuid(),
  mood_date date not null unique,
  mood text not null check (
    mood in ('happy', 'love', 'tired', 'sad', 'angry', 'crying')
  ),
  note text,
  created_at timestamptz not null default now()
);

-- Important dates (anniversaries, birthdays, trips...) used by the counter
-- and by the "next event" card on the home screen.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  is_recurring boolean not null default true,
  created_at timestamptz not null default now()
);

-- Singleton row holding couple-wide settings, starting with the
-- relationship start date used to compute "days together".
create table if not exists public.couple_settings (
  id boolean primary key default true constraint couple_settings_singleton check (id),
  relationship_start_date date not null,
  updated_at timestamptz not null default now()
);

alter table public.messages enable row level security;
alter table public.moods enable row level security;
alter table public.events enable row level security;
alter table public.couple_settings enable row level security;

create policy "Authenticated read messages" on public.messages
  for select to authenticated using (true);
create policy "Authenticated write messages" on public.messages
  for insert to authenticated with check (true);
create policy "Authenticated update messages" on public.messages
  for update to authenticated using (true) with check (true);
create policy "Authenticated delete messages" on public.messages
  for delete to authenticated using (true);

create policy "Authenticated read moods" on public.moods
  for select to authenticated using (true);
create policy "Authenticated write moods" on public.moods
  for insert to authenticated with check (true);
create policy "Authenticated update moods" on public.moods
  for update to authenticated using (true) with check (true);
create policy "Authenticated delete moods" on public.moods
  for delete to authenticated using (true);

create policy "Authenticated read events" on public.events
  for select to authenticated using (true);
create policy "Authenticated write events" on public.events
  for insert to authenticated with check (true);
create policy "Authenticated update events" on public.events
  for update to authenticated using (true) with check (true);
create policy "Authenticated delete events" on public.events
  for delete to authenticated using (true);

create policy "Authenticated read couple_settings" on public.couple_settings
  for select to authenticated using (true);
create policy "Authenticated write couple_settings" on public.couple_settings
  for insert to authenticated with check (true);
create policy "Authenticated update couple_settings" on public.couple_settings
  for update to authenticated using (true) with check (true);
