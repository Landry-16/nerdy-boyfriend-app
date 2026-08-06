import { supabase } from '../../lib/supabase'
import type { CoupleSettingsRow, EventRow } from '../../types/database'

export async function fetchCoupleSettings(): Promise<CoupleSettingsRow | null> {
  const { data, error } = await supabase.from('couple_settings').select('*').maybeSingle()

  if (error) throw error
  return data
}

export async function setRelationshipStartDate(isoDate: string): Promise<CoupleSettingsRow> {
  const { data, error } = await supabase
    .from('couple_settings')
    .upsert({ relationship_start_date: isoDate }, { onConflict: 'couple_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true })

  if (error) throw error
  return data
}

export async function createEvent(title: string, eventDate: string, isRecurring: boolean): Promise<EventRow> {
  const { data, error } = await supabase
    .from('events')
    .insert({ title, event_date: eventDate, is_recurring: isRecurring })
    .select()
    .single()

  if (error) throw error
  return data
}

export interface CounterData {
  settings: CoupleSettingsRow | null
  events: EventRow[]
}

export async function fetchCounterData(): Promise<CounterData> {
  const [settings, events] = await Promise.all([fetchCoupleSettings(), fetchEvents()])
  return { settings, events }
}
