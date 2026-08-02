import { useState, type FormEvent } from 'react'
import { createEvent } from './counter.api'
import { toIsoDate } from '../../lib/date'
import { DateField } from '../../components/DateField'

export function AddEventForm({ onSaved }: { onSaved: () => void }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(toIsoDate(new Date()))
  const [isRecurring, setIsRecurring] = useState(true)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      await createEvent(title, date, isRecurring)
      setTitle('')
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl bg-white/70 p-6">
      <p className="text-sm font-medium text-ink/70">Ajouter un evenement</p>
      <input
        type="text"
        required
        placeholder="Titre (ex: Anniversaire de rencontre)"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-sage"
      />
      <DateField required value={date} onChange={(event) => setDate(event.target.value)} />
      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(event) => setIsRecurring(event.target.checked)}
          className="h-4 w-4 rounded border-beige accent-sage"
        />
        Se repete chaque annee
      </label>
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl bg-sage px-4 py-3 font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
      >
        {saving ? 'Ajout...' : 'Ajouter'}
      </button>
    </form>
  )
}
