import { useState } from 'react'
import type { Mood } from '../../types/database'
import { moodOptions } from './moodOptions'
import { setMoodForDate } from './mood.api'

export function MoodPicker({ selected, onSaved }: { selected: Mood | null; onSaved: () => void }) {
  const [saving, setSaving] = useState<Mood | null>(null)

  async function handlePick(mood: Mood) {
    setSaving(mood)
    try {
      await setMoodForDate(new Date(), mood)
      onSaved()
    } finally {
      setSaving(null)
    }
  }

  return (
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
  )
}
