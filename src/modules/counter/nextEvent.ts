import type { EventRow } from '../../types/database'
import { nextOccurrence, parseIsoDate, toStartOfDay } from '../../lib/date'

export interface UpcomingEvent {
  event: EventRow
  date: Date
}

/** Finds the soonest upcoming occurrence among all events, if any. */
export function findNextEvent(events: readonly EventRow[], today: Date = new Date()): UpcomingEvent | null {
  const startOfToday = toStartOfDay(today)
  const upcoming = events
    .map((event) => ({ event, date: nextOccurrence(parseIsoDate(event.event_date), event.is_recurring, today) }))
    .filter(({ date }) => date.getTime() >= startOfToday.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  return upcoming[0] ?? null
}
