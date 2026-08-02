import { Link } from 'react-router-dom'
import { useCallback } from 'react'
import { useAsync } from '../../lib/useAsync'
import { fetchCounterData } from '../counter/counter.api'
import { findNextEvent } from '../counter/nextEvent'
import { daysTogether, formatDateShort, parseIsoDate } from '../../lib/date'
import { Card } from '../../components/Card'

export function CounterSummaryCard() {
  const fetcher = useCallback(fetchCounterData, [])
  const { data, loading } = useAsync(fetcher)

  if (loading || !data) {
    return <Card className="h-24 animate-pulse" />
  }

  const { settings, events } = data
  const next = findNextEvent(events)

  return (
    <Link to="/counter">
      <Card className="flex items-center justify-between">
        <div>
          {settings ? (
            <>
              <p className="text-2xl font-semibold text-sage-dark">
                {daysTogether(parseIsoDate(settings.relationship_start_date))}
              </p>
              <p className="text-xs text-ink/60">jours ensemble</p>
            </>
          ) : (
            <p className="text-sm text-ink/60">Renseigner notre date de debut</p>
          )}
        </div>
        {next && (
          <div className="text-right">
            <p className="text-xs text-ink/60">Prochain evenement</p>
            <p className="text-sm font-medium text-ink">{next.event.title}</p>
            <p className="text-xs text-ink/50">{formatDateShort(next.date)}</p>
          </div>
        )}
      </Card>
    </Link>
  )
}
