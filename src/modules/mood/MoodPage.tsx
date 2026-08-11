import { useCallback } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useAsync } from '../../lib/useAsync'
import { fetchOwnMoodForDate } from './mood.api'
import { MoodPicker } from './MoodPicker'
import { MoodCalendar } from './MoodCalendar'
import { Card } from '../../components/Card'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ErrorMessage } from '../../components/ErrorMessage'
import { toIsoDate } from '../../lib/date'

export function MoodPage() {
  const { session } = useAuth()
  const userId = session!.user.id
  const todayIso = toIsoDate(new Date())

  const fetcher = useCallback(() => fetchOwnMoodForDate(userId, todayIso), [userId, todayIso])
  const { data: todayMood, loading, error, refetch } = useAsync(fetcher)

  if (loading) return <LoadingScreen />
  if (error) return <ErrorMessage message="Impossible de charger ton humeur." />

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Humeur</h1>
        <p className="mt-1 text-sm text-ink/60">Comment tu te sens aujourd'hui ?</p>
      </header>

      <Card>
        <MoodPicker selected={todayMood?.mood ?? null} initialNote={todayMood?.note ?? ''} onSaved={refetch} />
      </Card>

      <MoodCalendar />
    </div>
  )
}
