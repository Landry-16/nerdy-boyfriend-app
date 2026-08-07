import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useProfile } from '../auth/ProfileContext'
import { useAsync } from '../../lib/useAsync'
import { fetchRoom, setRoomUrl, subscribeToRoom } from './room.api'
import { normalizeUrl } from './normalizeUrl'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ErrorMessage } from '../../components/ErrorMessage'

export function RoomPage() {
  const { profile } = useProfile()
  const coupleId = profile?.couple_id ?? null

  const fetcher = useCallback(fetchRoom, [])
  const { data: initialRoom, loading, error } = useAsync(fetcher)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [invalidUrl, setInvalidUrl] = useState(false)
  const [navigating, setNavigating] = useState(false)

  useEffect(() => {
    if (initialRoom) setCurrentUrl(initialRoom.current_url)
  }, [initialRoom])

  useEffect(() => {
    if (!coupleId) return
    return subscribeToRoom(coupleId, (room) => setCurrentUrl(room.current_url))
  }, [coupleId])

  async function handleNavigate(event: FormEvent) {
    event.preventDefault()
    const normalized = normalizeUrl(urlInput)
    if (!normalized) {
      setInvalidUrl(true)
      return
    }

    setInvalidUrl(false)
    setNavigating(true)
    try {
      setCurrentUrl(normalized) // optimistic: the realtime echo confirms this shortly after
      setUrlInput('')
      await setRoomUrl(normalized)
    } finally {
      setNavigating(false)
    }
  }

  if (loading) return <LoadingScreen />
  if (error) return <ErrorMessage message="Impossible de charger la room." />

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Room</h1>
        <p className="mt-1 text-sm text-ink/60">Naviguez ensemble, en direct.</p>
      </header>

      <form onSubmit={handleNavigate} className="flex gap-2">
        <input
          type="text"
          placeholder="Colle un lien..."
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          className="min-w-0 flex-1 rounded-2xl border border-beige bg-white px-4 py-3 text-sm text-ink outline-none focus:border-sage"
        />
        <button
          type="submit"
          disabled={navigating}
          className="rounded-2xl bg-sage px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
        >
          Aller
        </button>
      </form>
      {invalidUrl && <p className="text-sm text-red-500">Ce lien n'a pas l'air valide.</p>}

      <p className="text-xs text-ink/50">
        Certains sites refusent de s'afficher ici (Crunchyroll, Netflix, YouTube...). Dans ce cas, utilise le lien
        "ouvrir dans un nouvel onglet" ci-dessous.
      </p>

      {currentUrl ? (
        <>
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl bg-white/70 p-3 text-center text-sm text-ink/70 underline underline-offset-2"
          >
            Ouvrir dans un nouvel onglet
          </a>
          <div className="overflow-hidden rounded-3xl border border-beige">
            <iframe src={currentUrl} title="Room partagee" className="h-[60svh] w-full bg-white" />
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-ink/50">Personne n'a encore ouvert de page.</p>
      )}
    </div>
  )
}
