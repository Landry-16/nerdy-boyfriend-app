import { useCallback, useState } from 'react'
import { useAsync } from '../../lib/useAsync'
import { fetchCounterData } from './counter.api'
import { findNextEvent } from './nextEvent'
import { daysTogether, formatDateLong, parseIsoDate } from '../../lib/date'
import { Card } from '../../components/Card'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ErrorMessage } from '../../components/ErrorMessage'
import { StartDateForm } from './StartDateForm'
import { AddEventForm } from './AddEventForm'

export function CounterPage() {
  const fetcher = useCallback(fetchCounterData, [])
  const { data, loading, error, refetch } = useAsync(fetcher)
  const [editingStartDate, setEditingStartDate] = useState(false)

  if (loading) return <LoadingScreen />
  if (error || !data) return <ErrorMessage message="Impossible de charger le compteur." />

  const { settings, events } = data

  if (!settings) {
    return (
      <div className="animate-fade-in space-y-8">
        <header>
          <h1 className="text-2xl font-semibold text-ink">Compteur</h1>
        </header>
        <StartDateForm onSaved={refetch} />
      </div>
    )
  }

  const startDate = parseIsoDate(settings.relationship_start_date)
  const next = findNextEvent(events)

  return (
    <div className="animate-fade-in space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Compteur</h1>
        <p className="mt-1 text-sm text-ink/60">
          Ensemble depuis le {formatDateLong(startDate)}
          {!editingStartDate && (
            <button
              type="button"
              onClick={() => setEditingStartDate(true)}
              className="ml-2 text-xs text-sage-dark underline underline-offset-2"
            >
              Modifier
            </button>
          )}
        </p>
      </header>

      {editingStartDate ? (
        <StartDateForm
          initialDate={settings.relationship_start_date}
          onSaved={() => {
            setEditingStartDate(false)
            refetch()
          }}
          onCancel={() => setEditingStartDate(false)}
        />
      ) : (
        <Card className="text-center">
          <p className="text-4xl font-semibold text-sage-dark">{daysTogether(startDate)}</p>
          <p className="mt-1 text-sm text-ink/60">jours ensemble</p>
        </Card>
      )}

      {next && (
        <Card>
          <p className="text-sm text-ink/60">Prochain evenement</p>
          <p className="mt-1 text-lg font-medium text-ink">{next.event.title}</p>
          <p className="mt-1 text-sm text-ink/60">{formatDateLong(next.date)}</p>
        </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-ink/70">Tous les evenements</h2>
        {events.length === 0 && <p className="text-sm text-ink/50">Aucun evenement enregistre.</p>}
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-sm text-ink">{event.title}</span>
              <span className="text-xs text-ink/50">{formatDateLong(parseIsoDate(event.event_date))}</span>
            </li>
          ))}
        </ul>
      </section>

      <AddEventForm onSaved={refetch} />
    </div>
  )
}
