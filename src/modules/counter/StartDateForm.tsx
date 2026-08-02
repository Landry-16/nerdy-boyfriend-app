import { useState, type FormEvent } from 'react'
import { setRelationshipStartDate } from './counter.api'
import { toIsoDate } from '../../lib/date'

export function StartDateForm({ onSaved }: { onSaved: () => void }) {
  const [date, setDate] = useState(toIsoDate(new Date()))
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      await setRelationshipStartDate(date)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl bg-white/70 p-5">
      <p className="text-sm text-ink/70">Depuis quand etes-vous ensemble ?</p>
      <input
        type="date"
        required
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-sage"
      />
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl bg-sage px-4 py-3 font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
      >
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  )
}
