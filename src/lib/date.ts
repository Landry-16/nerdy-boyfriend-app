// Date helpers shared by the counter and home modules.
// All calculations work on calendar days (local time), ignoring time of day.

/** Truncates a date to midnight local time so day-based math stays exact. */
export function toStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

/** Number of full days between two dates. Positive when `end` is after `start`. */
export function daysBetween(start: Date, end: Date): number {
  const diff = toStartOfDay(end).getTime() - toStartOfDay(start).getTime()
  return Math.round(diff / ONE_DAY_MS)
}

/** Days together counted inclusively, so the start date itself is day 1. */
export function daysTogether(startDate: Date, today: Date = new Date()): number {
  return daysBetween(startDate, today) + 1
}

/**
 * Next occurrence of a yearly recurring date (birthday, anniversary...)
 * on or after `today`. Non-recurring events are returned unchanged.
 */
export function nextOccurrence(eventDate: Date, isRecurring: boolean, today: Date = new Date()): Date {
  if (!isRecurring) {
    return eventDate
  }

  const start = toStartOfDay(today)
  const candidate = new Date(start.getFullYear(), eventDate.getMonth(), eventDate.getDate())

  if (candidate.getTime() < start.getTime()) {
    candidate.setFullYear(candidate.getFullYear() + 1)
  }

  return candidate
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

/** Parses a Postgres `date` string (YYYY-MM-DD) as a local date, avoiding UTC shift. */
export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Formats a Date as a Postgres `date` string (YYYY-MM-DD) in local time. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * A Monday-first calendar grid for the given month, as complete weeks of 7
 * dates. Days from the adjacent months pad the first/last week so every row
 * is full; callers dim or ignore cells outside the target month.
 */
export function getMonthGrid(year: number, month: number): Date[][] {
  const firstOfMonth = new Date(year, month, 1)
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7 // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7
  const gridStart = new Date(year, month, 1 - firstWeekday)

  const weeks: Date[][] = []
  for (let week = 0; week < totalCells / 7; week++) {
    const days: Date[] = []
    for (let day = 0; day < 7; day++) {
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + week * 7 + day)
      days.push(date)
    }
    weeks.push(days)
  }

  return weeks
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}
