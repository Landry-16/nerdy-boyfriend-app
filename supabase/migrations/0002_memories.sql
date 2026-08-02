-- Phase 2 schema: memories (souvenirs) and the storage bucket for their
-- photos. The map is a view over memories that have coordinates, so it does
-- not need its own table.

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  memory_date date not null,
  location_name text,
  latitude double precision,
  longitude double precision,
  music_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.memory_photos (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references public.memories (id) on delete cascade,
  storage_path text not null,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists memory_photos_memory_id_idx on public.memory_photos (memory_id);

alter table public.memories enable row level security;
alter table public.memory_photos enable row level security;

create policy "Authenticated read memories" on public.memories
  for select to authenticated using (true);
create policy "Authenticated write memories" on public.memories
  for insert to authenticated with check (true);
create policy "Authenticated update memories" on public.memories
  for update to authenticated using (true) with check (true);
create policy "Authenticated delete memories" on public.memories
  for delete to authenticated using (true);

create policy "Authenticated read memory_photos" on public.memory_photos
  for select to authenticated using (true);
create policy "Authenticated write memory_photos" on public.memory_photos
  for insert to authenticated with check (true);
create policy "Authenticated delete memory_photos" on public.memory_photos
  for delete to authenticated using (true);

-- Storage bucket for memory photos. Public so photo URLs can be used
-- directly as <img src> without signed-URL refresh logic; storage paths are
-- randomly generated (see src/modules/memories/memories.api.ts) so they are
-- not guessable. The app itself still sits behind the shared login.
insert into storage.buckets (id, name, public)
values ('memory-photos', 'memory-photos', true)
on conflict (id) do nothing;

create policy "Authenticated read memory photo files" on storage.objects
  for select to authenticated using (bucket_id = 'memory-photos');
create policy "Authenticated upload memory photo files" on storage.objects
  for insert to authenticated with check (bucket_id = 'memory-photos');
create policy "Authenticated delete memory photo files" on storage.objects
  for delete to authenticated using (bucket_id = 'memory-photos');
