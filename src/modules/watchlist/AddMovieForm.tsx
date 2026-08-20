import { useEffect, useState, type FormEvent } from 'react'
import { addMovie } from './watchlist.api'
import { isTmdbConfigured, posterUrl, searchMovies, type TmdbSearchResult } from './tmdb'

const SEARCH_DEBOUNCE_MS = 400

export function AddMovieForm({ onAdded }: { onAdded: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TmdbSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (!isTmdbConfigured() || !query.trim()) {
      setResults([])
      return
    }

    setSearching(true)
    const timeout = setTimeout(() => {
      searchMovies(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setSearching(false))
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [query])

  async function handleAddResult(result: TmdbSearchResult) {
    setAdding(true)
    try {
      await addMovie(result.title, result)
      setQuery('')
      setResults([])
      onAdded()
    } finally {
      setAdding(false)
    }
  }

  async function handleAddRaw(event: FormEvent) {
    event.preventDefault()
    const title = query.trim()
    if (!title) return

    setAdding(true)
    try {
      await addMovie(title)
      setQuery('')
      setResults([])
      onAdded()
    } finally {
      setAdding(false)
    }
  }

  return (
    <form onSubmit={handleAddRaw} className="space-y-3 rounded-3xl bg-white/70 p-6">
      <p className="text-sm font-medium text-ink/70">Ajouter un film</p>
      <input
        type="text"
        placeholder="Titre du film..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-ink outline-none focus:border-sage"
      />

      {searching && <p className="text-xs text-ink/50">Recherche...</p>}

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((result) => (
            <li key={result.tmdbId}>
              <button
                type="button"
                disabled={adding}
                onClick={() => void handleAddResult(result)}
                className="flex w-full items-center gap-3 rounded-2xl bg-cream px-3 py-2 text-left transition-colors hover:bg-beige/50 disabled:opacity-60"
              >
                {result.posterPath ? (
                  <img src={posterUrl(result.posterPath)} alt="" className="h-14 w-10 rounded-lg object-cover" />
                ) : (
                  <span className="h-14 w-10 shrink-0 rounded-lg bg-beige/60" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{result.title}</span>
                  {result.releaseYear && <span className="text-xs text-ink/50">{result.releaseYear}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={adding || !query.trim()}
        className="w-full rounded-2xl bg-sage px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
      >
        {isTmdbConfigured() ? "Ajouter tel quel, sans recherche" : 'Ajouter'}
      </button>
    </form>
  )
}
