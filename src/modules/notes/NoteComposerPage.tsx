import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createNote } from './notes.api'
import { DrawingPad } from './DrawingPad'
import { ToggleButton } from '../../components/ToggleButton'
import { notifyPartner } from '../../lib/notify'
import type { NoteKind } from '../../types/database'

export function NoteComposerPage() {
  const navigate = useNavigate()
  const [kind, setKind] = useState<NoteKind>('text')
  const [text, setText] = useState('')
  const [drawingDataUrl, setDrawingDataUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const canSubmit = kind === 'text' ? text.trim().length > 0 : drawingDataUrl !== null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const content = kind === 'text' ? text.trim() : drawingDataUrl
    if (!content) return

    setSaving(true)
    try {
      await createNote(kind, content)
      notifyPartner('Un petit mot pour toi', kind === 'text' ? content : "Un dessin t'attend.", '/')
      navigate('/')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <Link to="/" className="text-sm text-ink/50 underline underline-offset-2">
          ← Accueil
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Laisser un petit mot</h1>
        <p className="mt-1 text-sm text-ink/60">Ca apparaitra sur son ecran d'accueil.</p>
      </header>

      <div className="flex gap-2">
        <ToggleButton active={kind === 'text'} onClick={() => setKind('text')}>
          Message
        </ToggleButton>
        <ToggleButton active={kind === 'drawing'} onClick={() => setKind('drawing')}>
          Dessin
        </ToggleButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white/70 p-6">
        {kind === 'text' ? (
          <textarea
            required
            rows={5}
            placeholder="Ecris quelque chose de doux..."
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-sage"
          />
        ) : (
          <DrawingPad onChange={setDrawingDataUrl} />
        )}

        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="w-full rounded-2xl bg-sage px-4 py-3 font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
        >
          {saving ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </div>
  )
}
