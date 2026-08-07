-- Small notes/doodles one partner leaves for the other, shown on the
-- recipient's home screen until they mark it seen. `content` holds plain
-- text for kind = 'text', or a PNG data URL for kind = 'drawing' - doodles
-- are small enough that a Storage bucket would be overkill here.

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) default public.current_couple_id(),
  created_by uuid references auth.users (id) default auth.uid(),
  kind text not null check (kind in ('text', 'drawing')),
  content text not null,
  seen_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "Couple can read notes" on public.notes
  for select to authenticated using (couple_id = public.current_couple_id());
create policy "Couple can write notes" on public.notes
  for insert to authenticated with check (couple_id = public.current_couple_id());
create policy "Couple can update notes" on public.notes
  for update to authenticated using (couple_id = public.current_couple_id()) with check (couple_id = public.current_couple_id());
create policy "Couple can delete notes" on public.notes
  for delete to authenticated using (couple_id = public.current_couple_id());

grant select, insert, update, delete on table public.notes to authenticated;
