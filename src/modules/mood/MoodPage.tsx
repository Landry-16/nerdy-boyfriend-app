import { useCallback } from 'react'
import { useAsync } from '../../lib/useAsync'
import { fetchMoods } from './mood.api'
import { MoodPicker } from './MoodPicker'
import { moodEmoji } from './moodOptions'
import { Card } from '../../components/Card'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ErrorMessage } from '../../components/ErrorMessage'
import { formatDateLong, parseIsoDate, toIsoDate } from '../../lib/date'

export function MoodPage() {
  const fetcher = useCallback(fetchMoods, [])
  const { data: moods, loading, error, refetch } = useAsync(fetcher)

  if (loading) return <LoadingScreen />
  if (error || !moods) return <ErrorMessage message="Impossible de charger les humeurs." />

  const todayIso = toIsoDate(new Date())
  const todayMood = moods.find((entry) => entry.mood_date === todayIso)?.mood ?? null

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Humeur</h1>
        <p className="text-sm text-ink/60">Comment te sens-tu aujourd'hui ?</p>
      </header>

      <Card>
        <MoodPicker selected={todayMood} onSaved={refetch} />
      </Card>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-ink/70">Historique</h2>
        {moods.length === 0 && <p className="text-sm text-ink/50">Aucune humeur enregistree pour le moment.</p>}
        <ul className="space-y-2">
          {moods.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-sm text-ink/80">{formatDateLong(parseIsoDate(entry.mood_date))}</span>
              <span className="text-xl">{moodEmoji(entry.mood)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
