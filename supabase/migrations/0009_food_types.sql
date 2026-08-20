-- Custom food types a couple adds on top of the built-in list (see
-- src/modules/food/foodTypes.ts). cuisine_tag is a best-effort search term
-- used against OpenStreetMap's `cuisine` tag when looking up nearby places
-- (src/modules/food/nearbyPlaces.ts); it defaults to the label itself.

create table public.food_types (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) default public.current_couple_id(),
  created_by uuid references auth.users (id) default auth.uid(),
  label text not null,
  cuisine_tag text not null,
  created_at timestamptz not null default now(),
  unique (couple_id, label)
);

alter table public.food_types enable row level security;

create policy "Couple can read food_types" on public.food_types
  for select to authenticated using (couple_id = public.current_couple_id());
create policy "Couple can write food_types" on public.food_types
  for insert to authenticated with check (couple_id = public.current_couple_id());
create policy "Couple can delete food_types" on public.food_types
  for delete to authenticated using (couple_id = public.current_couple_id());

grant select, insert, delete on table public.food_types to authenticated;
