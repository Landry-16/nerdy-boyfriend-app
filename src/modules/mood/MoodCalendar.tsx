import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useAsync } from '../../lib/useAsync'
import { fetchMoodsInRange } from './mood.api'
import { moodEmoji } from './moodOptions'
import { ErrorMessage } from '../../components/ErrorMessage'
import { getMonthGrid, formatMonthYear, formatDateLong, toIsoDate, parseIsoDate } from '../../lib/date'
import type { MoodRow } from '../../types/database'

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function MoodCalendar() {
  const { session } = useAuth()
  const userId = session?.user.id ?? null

  const [viewedMonth, setViewedMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const grid = useMemo(() => getMonthGrid(viewedMonth.year, viewedMonth.month), [viewedMonth])
  const rangeStart = toIsoDate(grid[0][0])
  const rangeEnd = toIsoDate(grid[grid.length - 1][6])

  const fetcher = useCallback(() => fetchMoodsInRange(rangeStart, rangeEnd), [rangeStart, rangeEnd])
  const { data: moods, loading, error } = useAsync(fetcher)

  const moodsByDate = useMemo(() => {
    const map = new Map<string, MoodRow[]>()
    for (const entry of moods ?? []) {
      const forDay = map.get(entry.mood_date) ?? []
      forDay.push(entry)
      map.set(entry.mood_date, forDay)
    }
    return map
  }, [moods])

  function changeMonth(delta: number) {
    setSelectedDate(null)
    setViewedMonth(({ year, month }) => {
      const next = new Date(year, month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  const monthLabel = formatMonthYear(new Date(viewedMonth.year, viewedMonth.month, 1))
  const todayIso = toIsoDate(new Date())
  const selectedEntries = selectedDate ? (moodsByDate.get(selectedDate) ?? []) : []

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Mois precedent"
          className="rounded-full p-2 text-ink/50 hover:bg-white/70"
        >
          ←
        </button>
        <h2 className="text-sm font-medium text-ink capitalize">{monthLabel}</h2>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Mois suivant"
          className="rounded-full p-2 text-ink/50 hover:bg-white/70"
        >
          →
        </button>
      </div>

      {error && <ErrorMessage message="Impossible de charger le calendrier des humeurs." />}

      {!error && (
        <div className={loading ? 'animate-pulse opacity-50' : ''}>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-ink/40">
            {WEEKDAY_LABELS.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.flatMap((week) =>
              week.map((date) => {
                const iso = toIsoDate(date)
                const inMonth = date.getMonth() === viewedMonth.month
                const entries = moodsByDate.get(iso) ?? []
                const hasEntries = entries.length > 0
                const isSelected = selectedDate === iso
                const isToday = iso === todayIso

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelectedDate(iso)}
                    disabled={!hasEntries}
                    className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-xs transition-colors ${
                      isSelected ? 'bg-sage/30' : hasEntries ? 'bg-white/70' : ''
                    } ${inMonth ? 'text-ink/70' : 'text-ink/25'}`}
                  >
                    <span className={isToday ? 'font-semibold text-sage-dark' : ''}>{date.getDate()}</span>
                    <span className="flex gap-0.5">
                      {entries.map((entry) => (
                        <span
                          key={entry.id}
                          className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none ring-2 ${
                            entry.created_by === userId ? 'ring-sage-dark' : 'ring-sky'
                          }`}
                        >
                          {moodEmoji(entry.mood)}
                        </span>
                      ))}
                    </span>
                  </button>
                )
              }),
            )}
          </div>
        </div>
      )}

      {selectedEntries.length > 0 && (
        <div className="animate-fade-in space-y-3 rounded-3xl bg-white/70 p-4">
          <p className="text-sm font-medium text-ink">{formatDateLong(parseIsoDate(selectedDate!))}</p>
          {selectedEntries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2 text-sm">
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ring-2 ${
                  entry.created_by === userId ? 'ring-sage-dark' : 'ring-sky'
                }`}
              >
                {moodEmoji(entry.mood)}
              </span>
              <div>
                <p className="text-xs text-ink/50">{entry.created_by === userId ? 'Toi' : 'Pas toi'}</p>
                {entry.note && <p className="text-ink/80">{entry.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 text-xs text-ink/50">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full ring-2 ring-sage-dark" /> Toi
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full ring-2 ring-sky" /> Pas toi
        </span>
      </div>
    </section>
  )
}
