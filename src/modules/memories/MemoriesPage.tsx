import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '../../lib/useAsync'
import { fetchMemories, getPhotoUrl, type MemoryWithPhotos } from './memories.api'
import { formatDateLong, parseIsoDate } from '../../lib/date'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ErrorMessage } from '../../components/ErrorMessage'
import { ToggleButton } from '../../components/ToggleButton'

type ViewMode = 'gallery' | 'timeline'
type SortOrder = 'recent' | 'oldest'

function matchesQuery(memory: MemoryWithPhotos, query: string): boolean {
  const haystack = `${memory.title} ${memory.location_name ?? ''}`.toLowerCase()
  return haystack.includes(query.toLowerCase())
}

export function MemoriesPage() {
  const fetcher = useCallback(fetchMemories, [])
  const { data: memories, loading, error } = useAsync(fetcher)
  const [view, setView] = useState<ViewMode>('gallery')
  const [sort, setSort] = useState<SortOrder>('recent')
  const [query, setQuery] = useState('')

  const visibleMemories = useMemo(() => {
    if (!memories) return []
    const filtered = query.trim() ? memories.filter((memory) => matchesQuery(memory, query)) : memories
    const sorted = [...filtered].sort((a, b) => a.memory_date.localeCompare(b.memory_date))
    return sort === 'recent' ? sorted.reverse() : sorted
  }, [memories, query, sort])

  if (loading) return <LoadingScreen />
  if (error || !memories) return <ErrorMessage message="Impossible de charger les souvenirs." />

  return (
    <div className="animate-fade-in space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Souvenirs</h1>
          <p className="mt-1 text-sm text-ink/60">{memories.length} souvenir(s)</p>
        </div>
        <Link
          to="/memories/new"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-sage text-xl text-white shadow-sm transition-transform hover:scale-105"
          aria-label="Ajouter un souvenir"
          title="Ajouter un souvenir"
        >
          +
        </Link>
      </header>

      <div className="space-y-3">
        <input
          type="search"
          placeholder="Rechercher par titre ou lieu..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-ink outline-none focus:border-sage"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <ToggleButton active={view === 'gallery'} onClick={() => setView('gallery')}>
              Galerie
            </ToggleButton>
            <ToggleButton active={view === 'timeline'} onClick={() => setView('timeline')}>
              Chronologie
            </ToggleButton>
          </div>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOrder)}
            className="rounded-xl border border-beige bg-white px-3 py-2 text-xs text-ink outline-none"
          >
            <option value="recent">Plus recent</option>
            <option value="oldest">Plus ancien</option>
          </select>
        </div>
      </div>

      {visibleMemories.length === 0 && (
        <p className="text-center text-sm text-ink/50">Aucun souvenir pour le moment.</p>
      )}

      {view === 'gallery' ? (
        <div className="grid grid-cols-2 gap-3">
          {visibleMemories.map((memory) => (
            <GalleryTile key={memory.id} memory={memory} />
          ))}
        </div>
      ) : (
        <ul className="space-y-3">
          {visibleMemories.map((memory) => (
            <TimelineRow key={memory.id} memory={memory} />
          ))}
        </ul>
      )}
    </div>
  )
}

function GalleryTile({ memory }: { memory: MemoryWithPhotos }) {
  const cover = memory.photos[0]

  return (
    <Link
      to={`/memories/${memory.id}`}
      className="block overflow-hidden rounded-3xl bg-white/70 shadow-sm transition-transform hover:scale-[1.02]"
    >
      <div className="aspect-square w-full bg-beige/60">
        {cover ? (
          <img src={getPhotoUrl(cover.storage_path)} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">photo i guess</div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-ink">{memory.title}</p>
        <p className="text-xs text-ink/50">{formatDateLong(parseIsoDate(memory.memory_date))}</p>
      </div>
    </Link>
  )
}

function TimelineRow({ memory }: { memory: MemoryWithPhotos }) {
  const cover = memory.photos[0]

  return (
    <Link
      to={`/memories/${memory.id}`}
      className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 transition-transform hover:scale-[1.01]"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-beige/60">
        {cover ? (
          <img src={getPhotoUrl(cover.storage_path)} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl">photo i guess</div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{memory.title}</p>
        <p className="text-xs text-ink/50">
          {formatDateLong(parseIsoDate(memory.memory_date))}
          {memory.location_name ? ` · ${memory.location_name}` : ''}
        </p>
      </div>
    </Link>
  )
}
