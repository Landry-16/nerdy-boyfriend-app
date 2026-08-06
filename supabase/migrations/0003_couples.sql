-- Phase: individual accounts + couples.
--
-- Replaces the single-shared-login model with one Supabase Auth account per
-- person. Two accounts pair up (via a short invite code) to form a couple,
-- and every existing table becomes scoped to couple_id so that unrelated
-- couples sharing this Supabase project cannot see each other's data. This
-- is a hard requirement, not an enhancement: without it, RLS still only
-- checks "authenticated", which would let any signed-up user read and write
-- every other couple's data.
--
-- created_by columns are added to record who took an action within a couple
-- (not for access control), laying the groundwork for attribution in future
-- features (messaging, personalized popups).

-- ---------------------------------------------------------------------
-- Couples and profiles
-- ---------------------------------------------------------------------

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  couple_id uuid references public.couples (id) on delete set null,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- Every signup gets a profile row automatically; the client never inserts
-- into public.profiles directly.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Resolves the calling user's couple_id. security definer so it can read
-- public.profiles regardless of that table's own RLS policies (avoiding any
-- recursive-policy edge cases), and so it can be used as a column default.
create function public.current_couple_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id from public.profiles where id = auth.uid();
$$;

-- Pairing is only possible through these two functions: they enforce "not
-- already in a couple" and "a couple has at most 2 members" server-side, so
-- a buggy or malicious client cannot bypass those rules by writing to
-- public.profiles / public.couples directly (which is why those tables have
-- no client-facing insert/update policies for couple_id, see below).
create function public.create_couple()
returns public.couples
language plpgsql
security definer
set search_path = public
as $$
declare
  new_couple public.couples;
  generated_code text;
begin
  if exists (select 1 from public.profiles where id = auth.uid() and couple_id is not null) then
    raise exception 'already_in_a_couple';
  end if;

  loop
    generated_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from public.couples where invite_code = generated_code);
  end loop;

  insert into public.couples (invite_code) values (generated_code) returning * into new_couple;
  update public.profiles set couple_id = new_couple.id where id = auth.uid();

  return new_couple;
end;
$$;

create function public.join_couple_by_code(code text)
returns public.couples
language plpgsql
security definer
set search_path = public
as $$
declare
  target_couple public.couples;
  member_count int;
begin
  if exists (select 1 from public.profiles where id = auth.uid() and couple_id is not null) then
    raise exception 'already_in_a_couple';
  end if;

  select * into target_couple from public.couples where invite_code = upper(code);
  if not found then
    raise exception 'invalid_code';
  end if;

  select count(*) into member_count from public.profiles where couple_id = target_couple.id;
  if member_count >= 2 then
    raise exception 'couple_full';
  end if;

  update public.profiles set couple_id = target_couple.id where id = auth.uid();

  return target_couple;
end;
$$;

grant execute on function public.create_couple() to authenticated;
grant execute on function public.join_couple_by_code(text) to authenticated;

alter table public.couples enable row level security;
alter table public.profiles enable row level security;

create policy "Members can read own couple" on public.couples
  for select to authenticated using (id = public.current_couple_id());

create policy "Read own profile" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "Read partner profile" on public.profiles
  for select to authenticated using (couple_id is not null and couple_id = public.current_couple_id());

-- ---------------------------------------------------------------------
-- Scope existing tables to couple_id. A fixed id is used for the "legacy"
-- couple so later statements in this migration can reference it directly.
-- ---------------------------------------------------------------------

insert into public.couples (id, invite_code)
values ('00000000-0000-0000-0000-000000000001', upper(substr(md5(random()::text), 1, 6)));

alter table public.messages add column couple_id uuid references public.couples (id) default public.current_couple_id();
alter table public.messages add column created_by uuid references auth.users (id) default auth.uid();
update public.messages set couple_id = '00000000-0000-0000-0000-000000000001';
alter table public.messages alter column couple_id set not null;

alter table public.moods add column couple_id uuid references public.couples (id) default public.current_couple_id();
alter table public.moods add column created_by uuid references auth.users (id) default auth.uid();
update public.moods set couple_id = '00000000-0000-0000-0000-000000000001';
alter table public.moods alter column couple_id set not null;
alter table public.moods drop constraint moods_mood_date_key;
alter table public.moods add constraint moods_couple_id_mood_date_key unique (couple_id, mood_date);

alter table public.events add column couple_id uuid references public.couples (id) default public.current_couple_id();
alter table public.events add column created_by uuid references auth.users (id) default auth.uid();
update public.events set couple_id = '00000000-0000-0000-0000-000000000001';
alter table public.events alter column couple_id set not null;

alter table public.memories add column couple_id uuid references public.couples (id) default public.current_couple_id();
alter table public.memories add column created_by uuid references auth.users (id) default auth.uid();
update public.memories set couple_id = '00000000-0000-0000-0000-000000000001';
alter table public.memories alter column couple_id set not null;

-- couple_settings was a boolean-singleton table (one row, full stop), which
-- cannot express "one row per couple". Recreated from scratch and the old
-- row's data is carried over to the legacy couple.
create table public.couple_settings_new (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null default public.current_couple_id() unique references public.couples (id) on delete cascade,
  relationship_start_date date not null,
  updated_at timestamptz not null default now()
);
insert into public.couple_settings_new (couple_id, relationship_start_date, updated_at)
select '00000000-0000-0000-0000-000000000001', relationship_start_date, updated_at from public.couple_settings;
drop table public.couple_settings;
alter table public.couple_settings_new rename to couple_settings;

-- ---------------------------------------------------------------------
-- Replace the old "any authenticated user" policies with couple-scoped ones.
-- ---------------------------------------------------------------------

drop policy "Authenticated read messages" on public.messages;
drop policy "Authenticated write messages" on public.messages;
drop policy "Authenticated update messages" on public.messages;
drop policy "Authenticated delete messages" on public.messages;

create policy "Couple can read messages" on public.messages
  for select to authenticated using (couple_id = public.current_couple_id());
create policy "Couple can write messages" on public.messages
  for insert to authenticated with check (couple_id = public.current_couple_id());
create policy "Couple can update messages" on public.messages
  for update to authenticated using (couple_id = public.current_couple_id()) with check (couple_id = public.current_couple_id());
create policy "Couple can delete messages" on public.messages
  for delete to authenticated using (couple_id = public.current_couple_id());

drop policy "Authenticated read moods" on public.moods;
drop policy "Authenticated write moods" on public.moods;
drop policy "Authenticated update moods" on public.moods;
drop policy "Authenticated delete moods" on public.moods;

create policy "Couple can read moods" on public.moods
  for select to authenticated using (couple_id = public.current_couple_id());
create policy "Couple can write moods" on public.moods
  for insert to authenticated with check (couple_id = public.current_couple_id());
create policy "Couple can update moods" on public.moods
  for update to authenticated using (couple_id = public.current_couple_id()) with check (couple_id = public.current_couple_id());
create policy "Couple can delete moods" on public.moods
  for delete to authenticated using (couple_id = public.current_couple_id());

drop policy "Authenticated read events" on public.events;
drop policy "Authenticated write events" on public.events;
drop policy "Authenticated update events" on public.events;
drop policy "Authenticated delete events" on public.events;

create policy "Couple can read events" on public.events
  for select to authenticated using (couple_id = public.current_couple_id());
create policy "Couple can write events" on public.events
  for insert to authenticated with check (couple_id = public.current_couple_id());
create policy "Couple can update events" on public.events
  for update to authenticated using (couple_id = public.current_couple_id()) with check (couple_id = public.current_couple_id());
create policy "Couple can delete events" on public.events
  for delete to authenticated using (couple_id = public.current_couple_id());

alter table public.couple_settings enable row level security;
create policy "Couple can read couple_settings" on public.couple_settings
  for select to authenticated using (couple_id = public.current_couple_id());
create policy "Couple can write couple_settings" on public.couple_settings
  for insert to authenticated with check (couple_id = public.current_couple_id());
create policy "Couple can update couple_settings" on public.couple_settings
  for update to authenticated using (couple_id = public.current_couple_id()) with check (couple_id = public.current_couple_id());

drop policy "Authenticated read memories" on public.memories;
drop policy "Authenticated write memories" on public.memories;
drop policy "Authenticated update memories" on public.memories;
drop policy "Authenticated delete memories" on public.memories;

create policy "Couple can read memories" on public.memories
  for select to authenticated using (couple_id = public.current_couple_id());
create policy "Couple can write memories" on public.memories
  for insert to authenticated with check (couple_id = public.current_couple_id());
create policy "Couple can update memories" on public.memories
  for update to authenticated using (couple_id = public.current_couple_id()) with check (couple_id = public.current_couple_id());
create policy "Couple can delete memories" on public.memories
  for delete to authenticated using (couple_id = public.current_couple_id());

drop policy "Authenticated read memory_photos" on public.memory_photos;
drop policy "Authenticated write memory_photos" on public.memory_photos;
drop policy "Authenticated delete memory_photos" on public.memory_photos;

create policy "Couple can read memory_photos" on public.memory_photos
  for select to authenticated using (
    memory_id in (select id from public.memories where couple_id = public.current_couple_id())
  );
create policy "Couple can write memory_photos" on public.memory_photos
  for insert to authenticated with check (
    memory_id in (select id from public.memories where couple_id = public.current_couple_id())
  );
create policy "Couple can delete memory_photos" on public.memory_photos
  for delete to authenticated using (
    memory_id in (select id from public.memories where couple_id = public.current_couple_id())
  );

-- ---------------------------------------------------------------------
-- Table-level grants. RLS policies only restrict which rows a role can
-- touch; the role still needs a base privilege to touch the table at all.
-- Supabase Cloud configures this automatically for every project, but a
-- local stack started via the CLI (`supabase start`) does not, so it is
-- made explicit here for every app table, old and new (safe to re-run: a
-- GRANT that already holds is a no-op, not an error).
-- ---------------------------------------------------------------------

grant select, insert, update, delete on table
  public.messages,
  public.moods,
  public.events,
  public.couple_settings,
  public.memories,
  public.memory_photos
to authenticated;

-- couples/profiles are read directly by the client, but only ever written
-- through the security definer functions/trigger above (which run with the
-- function owner's privileges, bypassing grants), so no write grant here.
grant select on table public.couples, public.profiles to authenticated;

-- ---------------------------------------------------------------------
-- Storage: photo files live under `${memoryId}/...`, so uploads/deletes can
-- be tied to the owning memory's couple. Reads stay bucket-wide (the bucket
-- is public, so RLS on select is not a real access boundary here anyway,
-- see 0002_memories.sql).
-- ---------------------------------------------------------------------

drop policy "Authenticated upload memory photo files" on storage.objects;
drop policy "Authenticated delete memory photo files" on storage.objects;

create policy "Couple can upload their memory photo files" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1]::uuid in (
      select id from public.memories where couple_id = public.current_couple_id()
    )
  );
create policy "Couple can delete their memory photo files" on storage.objects
  for delete to authenticated using (
    bucket_id = 'memory-photos'
    and (storage.foldername(name))[1]::uuid in (
      select id from public.memories where couple_id = public.current_couple_id()
    )
  );
