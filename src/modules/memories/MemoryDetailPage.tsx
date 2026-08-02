import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAsync } from '../../lib/useAsync'
import { deleteMemory, fetchMemory, getPhotoUrl } from './memories.api'
import { formatDateLong, parseIsoDate } from '../../lib/date'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ErrorMessage } from '../../components/ErrorMessage'
import { Card } from '../../components/Card'

export function MemoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)

  const fetcher = useCallback(() => fetchMemory(id!), [id])
  const { data: memory, loading, error } = useAsync(fetcher)

  if (loading) return <LoadingScreen />
  if (error || !memory) return <ErrorMessage message="Impossible de charger ce souvenir." />

  async function handleDelete() {
    if (!memory) return
    if (!confirm('Supprimer ce souvenir et ses photos ?')) return

    setDeleting(true)
    try {
      await deleteMemory(memory)
      navigate('/memories')
    } finally {
      setDeleting(false)
    }
  }

  const hasLocation = memory.latitude !== null && memory.longitude !== null

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <Link to="/memories" className="text-sm text-ink/50 underline underline-offset-2">
          ← Souvenirs
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-ink">{memory.title}</h1>
        <p className="mt-1 text-sm text-ink/60">
          {formatDateLong(parseIsoDate(memory.memory_date))}
          {memory.location_name ? ` · ${memory.location_name}` : ''}
        </p>
      </header>

      {memory.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {memory.photos.map((photo) => (
            <img
              key={photo.id}
              src={getPhotoUrl(photo.storage_path)}
              alt=""
              className="aspect-square w-full rounded-3xl object-cover"
            />
          ))}
        </div>
      )}

      {memory.description && (
        <Card>
          <p className="whitespace-pre-line text-sm text-ink/80">{memory.description}</p>
        </Card>
      )}

      {memory.music_url && (
        <a
          href={memory.music_url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-2xl bg-white/70 p-4 text-center text-sm text-ink/70 underline underline-offset-2"
        >
          🎵 Ecouter la musique de ce souvenir
        </a>
      )}

      {hasLocation && (
        <Link to="/map" className="block rounded-2xl bg-white/70 p-4 text-center text-sm text-ink/70">
          📍 Voir sur la carte
        </Link>
      )}

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="w-full rounded-2xl bg-pink/40 px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-pink/60 disabled:opacity-60"
      >
        {deleting ? 'Suppression...' : 'Supprimer ce souvenir'}
      </button>
    </div>
  )
}
