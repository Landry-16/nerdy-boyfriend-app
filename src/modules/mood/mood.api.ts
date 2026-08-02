import { supabase } from '../../lib/supabase'
import type { Mood, MoodRow } from '../../types/database'
import { toIsoDate } from '../../lib/date'

export async function fetchMoods(limit = 60): Promise<MoodRow[]> {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .order('mood_date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/** Creates or replaces today's mood entry. One entry per calendar day. */
export async function setMoodForDate(date: Date, mood: Mood, note?: string): Promise<MoodRow> {
  const { data, error } = await supabase
    .from('moods')
    .upsert({ mood_date: toIsoDate(date), mood, note: note ?? null }, { onConflict: 'mood_date' })
    .select()
    .single()

  if (error) throw error
  return data
}
