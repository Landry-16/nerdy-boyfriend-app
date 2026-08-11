import { useEffect, useState } from 'react'
import type { Mood } from '../../types/database'
import { moodOptions } from './moodOptions'
import { setMoodForDate } from './mood.api'

export function MoodPicker({
  selected,
  initialNote,
  onSaved,
}: {
  selected: Mood | null
  initialNote: string
  onSaved: () => void
}) {
  const [saving, setSaving] = useState<Mood | null>(null)
  const [note, setNote] = useState(initialNote)
  const [savingNote, setSavingNote] = useState(false)

  // Keep the note field in sync when the day's entry loads or is refetched.
  useEffect(() => {
    setNote(initialNote)
  }, [initialNote])

  async function handlePick(mood: Mood) {
    setSaving(mood)
    try {
      await setMoodForDate(new Date(), mood, note || undefined)
      onSaved()
    } finally {
      setSaving(null)
    }
  }

  async function handleSaveNote() {
    if (!selected) return
    setSavingNote(true)
    try {
      await setMoodForDate(new Date(), selected, note || undefined)
      onSaved()
    } finally {
      setSavingNote(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between gap-1">
        {moodOptions.map((option) => {
          const isSelected = selected === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handlePick(option.value)}
              disabled={saving !== null}
              aria-label={option.label}
              title={option.label}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform hover:scale-105 ${
                isSelected ? 'bg-sage/30 ring-2 ring-sage' : 'bg-white/70'
              } ${saving === option.value ? 'animate-pulse' : ''}`}
            >
              {option.emoji}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="space-y-2">
          <textarea
            rows={2}
            placeholder="Un petit mot sur ta journee (optionnel)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full rounded-2xl border border-beige bg-white px-3 py-2 text-sm text-ink outline-none focus:border-sage"
          />
          <button
            type="button"
            onClick={() => void handleSaveNote()}
            disabled={savingNote}
            className="text-xs text-sage-dark underline underline-offset-2 disabled:opacity-60"
          >
            {savingNote ? 'Enregistrement...' : 'Enregistrer la description'}
          </button>
        </div>
      )}
    </div>
  )
}
