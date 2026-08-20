-- A shared list of movies the couple wants to watch. tmdb_id/poster_path/
-- overview/release_year are optional enrichment from The Movie Database API
-- (see src/modules/watchlist/tmdb.ts); title alone is always required, so a
-- movie can be added even when the API has no match or is unavailable.

create table public.watchlist_movies (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) default public.current_couple_id(),
  created_by uuid references auth.users (id) default auth.uid(),
  title text not null,
  tmdb_id integer,
  poster_path text,
  overview text,
  release_year smallint,
  created_at timestamptz not null default now()
);

alter table public.watchlist_movies enable row level security;

create policy "Couple can read watchlist_movies" on public.watchlist_movies
  for select to authenticated using (couple_id = public.current_couple_id());
create policy "Couple can write watchlist_movies" on public.watchlist_movies
  for insert to authenticated with check (couple_id = public.current_couple_id());
create policy "Couple can delete watchlist_movies" on public.watchlist_movies
  for delete to authenticated using (couple_id = public.current_couple_id());

grant select, insert, delete on table public.watchlist_movies to authenticated;
