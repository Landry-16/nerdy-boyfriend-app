import { useCallback } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useAsync } from '../../lib/useAsync'
import { fetchLatestUnseenNote, markNoteSeen } from './notes.api'
import { Card } from '../../components/Card'

/** Shows the partner's latest note, if any, until dismissed. Renders nothing otherwise. */
export function PartnerNoteCard() {
  const { session } = useAuth()
  const userId = session?.user.id ?? null

  const fetcher = useCallback(() => (userId ? fetchLatestUnseenNote(userId) : Promise.resolve(null)), [userId])
  const { data: note, loading, refetch } = useAsync(fetcher)

  if (loading || !note) return null

  async function handleDismiss() {
    await markNoteSeen(note!.id)
    refetch()
  }

  return (
    <Card className="animate-fade-in space-y-3 text-center">
      <p className="text-xs font-medium tracking-wide text-sage-dark uppercase">Un petit mot pour toi</p>
      {note.kind === 'text' ? (
        <p className="text-lg text-ink">{note.content}</p>
      ) : (
        <img src={note.content} alt="Dessin de ton/ta partenaire" className="mx-auto rounded-2xl" />
      )}
      <button
        type="button"
        onClick={() => void handleDismiss()}
        className="text-xs text-ink/50 underline underline-offset-2"
      >
        Marquer comme lu
      </button>
    </Card>
  )
}
