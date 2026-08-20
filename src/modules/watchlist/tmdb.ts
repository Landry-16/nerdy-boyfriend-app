// The Movie Database (TMDb) API v3: free, signup-only (no billing), the
// standard choice for this kind of hobby lookup. The v3 API key is meant
// for client-side use per TMDb's own docs (read-only public data, no
// billing risk), unlike a Supabase secret key or a VAPID private key.
const TMDB_API_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342'

export interface TmdbSearchResult {
  tmdbId: number
  title: string
  releaseYear: number | null
  overview: string | null
  posterPath: string | null
}

export function isTmdbConfigured(): boolean {
  return Boolean(import.meta.env.VITE_TMDB_API_KEY)
}

export function posterUrl(posterPath: string): string {
  return `${TMDB_IMAGE_BASE}${posterPath}`
}

export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY
  if (!apiKey || !query.trim()) return []

  const url = `${TMDB_API_BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=fr-FR`
  const response = await fetch(url)
  if (!response.ok) throw new Error('tmdb_request_failed')

  const json: {
    results: {
      id: number
      title: string
      release_date: string | null
      overview: string | null
      poster_path: string | null
    }[]
  } = await response.json()

  return json.results.slice(0, 8).map((result) => ({
    tmdbId: result.id,
    title: result.title,
    releaseYear: result.release_date ? Number(result.release_date.slice(0, 4)) : null,
    overview: result.overview || null,
    posterPath: result.poster_path,
  }))
}
