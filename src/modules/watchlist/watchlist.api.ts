import { supabase } from '../../lib/supabase'
import type { WatchlistMovieRow } from '../../types/database'
import type { TmdbSearchResult } from './tmdb'

export async function fetchWatchlist(): Promise<WatchlistMovieRow[]> {
  const { data, error } = await supabase.from('watchlist_movies').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return data
}

/** Adds a movie either from a TMDb search result or a plain title (no API match). */
export async function addMovie(title: string, tmdbResult?: TmdbSearchResult): Promise<WatchlistMovieRow> {
  const { data, error } = await supabase
    .from('watchlist_movies')
    .insert({
      title,
      tmdb_id: tmdbResult?.tmdbId ?? null,
      poster_path: tmdbResult?.posterPath ?? null,
      overview: tmdbResult?.overview ?? null,
      release_year: tmdbResult?.releaseYear ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeMovie(id: string): Promise<void> {
  const { error } = await supabase.from('watchlist_movies').delete().eq('id', id)
  if (error) throw error
}
