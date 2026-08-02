import type { MessageRow } from '../../types/database'
import { seededShuffle } from '../../lib/seededShuffle'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

/**
 * Picks the message of the day for a given date.
 *
 * Messages are grouped into cycles of `messages.length` days. Each cycle is
 * a deterministic shuffle of every message, so all messages are shown
 * exactly once before any of them repeats, matching the spec: "un seul
 * message par jour" and "les messages reapparaissent apres avoir parcouru
 * tous les messages disponibles".
 *
 * Sorting by id first keeps cycles stable as messages are added over time.
 */
export function getDailyMessage(messages: readonly MessageRow[], date: Date = new Date()): MessageRow | null {
  if (messages.length === 0) {
    return null
  }

  const ordered = [...messages].sort((a, b) => a.id.localeCompare(b.id))
  const dayIndex = Math.floor(date.getTime() / ONE_DAY_MS)
  const cycleIndex = Math.floor(dayIndex / ordered.length)
  const positionInCycle = dayIndex % ordered.length

  return seededShuffle(ordered, cycleIndex)[positionInCycle]
}
