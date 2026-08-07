-- A single shared "browsing room" per couple: one current URL both partners
-- see, kept in sync live via Supabase Realtime (postgres_changes) rather
-- than polling. Either partner can navigate; there is no lock/turn system.
--
-- This is a best-effort feature: most sites (all video streaming platforms
-- in particular) refuse to be displayed in an iframe via X-Frame-Options or
-- a frame-ancestors CSP, which the browser enforces and page JS cannot see
-- or work around. The app always shows an "open in a new tab" fallback
-- alongside the iframe for this reason (see src/modules/room/RoomPage.tsx).

create table public.browse_room (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null unique references public.couples (id) default public.current_couple_id(),
  current_url text,
  updated_by uuid references auth.users (id) default auth.uid(),
  updated_at timestamptz not null default now()
);

alter table public.browse_room enable row level security;

create policy "Couple can read browse_room" on public.browse_room
  for select to authenticated using (couple_id = public.current_couple_id());
create policy "Couple can write browse_room" on public.browse_room
  for insert to authenticated with check (couple_id = public.current_couple_id());
create policy "Couple can update browse_room" on public.browse_room
  for update to authenticated using (couple_id = public.current_couple_id()) with check (couple_id = public.current_couple_id());

grant select, insert, update on table public.browse_room to authenticated;

alter publication supabase_realtime add table public.browse_room;
