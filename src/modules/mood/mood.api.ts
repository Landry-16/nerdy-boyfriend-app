import { supabase } from '../../lib/supabase'
import type { Mood, MoodRow } from '../../types/database'
import { toIsoDate } from '../../lib/date'

/** All of the couple's mood entries (both partners) with a date in [startIso, endIso]. */
export async function fetchMoodsInRange(startIso: string, endIso: string): Promise<MoodRow[]> {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .gte('mood_date', startIso)
    .lte('mood_date', endIso)

  if (error) throw error
  return data
}

/** The signed-in user's own mood entry for a given day, if they logged one. */
export async function fetchOwnMoodForDate(userId: string, isoDate: string): Promise<MoodRow | null> {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .eq('created_by', userId)
    .eq('mood_date', isoDate)
    .maybeSingle()

  if (error) throw error
  return data
}

/** Creates or replaces the signed-in user's mood entry for a day. One entry per person, per day. */
export async function setMoodForDate(date: Date, mood: Mood, note?: string): Promise<MoodRow> {
  const { data, error } = await supabase
    .from('moods')
    .upsert({ mood_date: toIsoDate(date), mood, note: note ?? null }, { onConflict: 'created_by,mood_date' })
    .select()
    .single()

  if (error) throw error
  return data
}
