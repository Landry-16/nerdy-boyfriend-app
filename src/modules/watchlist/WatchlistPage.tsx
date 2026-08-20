import { useCallback, useState } from 'react'
import { useAsync } from '../../lib/useAsync'
import { fetchWatchlist, removeMovie } from './watchlist.api'
import { posterUrl } from './tmdb'
import { AddMovieForm } from './AddMovieForm'
import { Card } from '../../components/Card'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ErrorMessage } from '../../components/ErrorMessage'
import type { WatchlistMovieRow } from '../../types/database'

export function WatchlistPage() {
  const fetcher = useCallback(fetchWatchlist, [])
  const { data: movies, loading, error, refetch } = useAsync(fetcher)

  const [pick, setPick] = useState<WatchlistMovieRow | null>(null)
  const [excluded, setExcluded] = useState<Set<string>>(new Set())

  if (loading) return <LoadingScreen />
  if (error || !movies) return <ErrorMessage message="Impossible de charger la watchlist." />

  function pickRandom(exclude: Set<string>) {
    const list = movies ?? []
    const available = list.filter((movie) => !exclude.has(movie.id))
    const pool = available.length > 0 ? available : list
    const choice = pool[Math.floor(Math.random() * pool.length)]
    setPick(choice ?? null)
  }

  function handleChoose() {
    setExcluded(new Set())
    pickRandom(new Set())
  }

  function handleAgain() {
    if (!pick) return
    const nextExcluded = new Set(excluded).add(pick.id)
    setExcluded(nextExcluded)
    pickRandom(nextExcluded)
  }

  function handleClear() {
    setPick(null)
    setExcluded(new Set())
  }

  async function handleRemove(id: string) {
    await removeMovie(id)
    if (pick?.id === id) setPick(null)
    refetch()
  }

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Watchlist</h1>
        <p className="mt-1 text-sm text-ink/60">{movies.length} film(s) dans la liste.</p>
      </header>

      {movies.length > 0 &&
        (pick ? (
          <Card className="space-y-4 text-center">
            {pick.poster_path && (
              <img src={posterUrl(pick.poster_path)} alt="" className="mx-auto h-48 w-32 rounded-2xl object-cover" />
            )}
            <div>
              <p className="text-xl font-semibold text-sage-dark">{pick.title}</p>
              {pick.release_year && <p className="text-sm text-ink/50">{pick.release_year}</p>}
            </div>
            {pick.overview && <p className="text-sm text-ink/70">{pick.overview}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAgain}
                className="flex-1 rounded-2xl bg-sage px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-dark"
              >
                Encore
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 rounded-2xl bg-beige/60 px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-beige"
              >
                Effacer
              </button>
            </div>
          </Card>
        ) : (
          <button
            type="button"
            onClick={handleChoose}
            className="w-full rounded-3xl bg-sage px-4 py-6 text-lg font-medium text-white shadow-sm transition-colors hover:bg-sage-dark"
          >
            Choisir un film
          </button>
        ))}

      <AddMovieForm onAdded={refetch} />

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-ink/70">La liste</h2>
        {movies.length === 0 && <p className="text-sm text-ink/50">Aucun film pour le moment.</p>}
        <ul className="space-y-2">
          {movies.map((movie) => (
            <li key={movie.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3">
              {movie.poster_path ? (
                <img src={posterUrl(movie.poster_path)} alt="" className="h-16 w-11 rounded-lg object-cover" />
              ) : (
                <span className="h-16 w-11 shrink-0 rounded-lg bg-beige/60" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{movie.title}</p>
                {movie.release_year && <p className="text-xs text-ink/50">{movie.release_year}</p>}
              </div>
              <button
                type="button"
                onClick={() => void handleRemove(movie.id)}
                aria-label={`Retirer ${movie.title}`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink/40 hover:bg-beige/60"
              >
                x
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
