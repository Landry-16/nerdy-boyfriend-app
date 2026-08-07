import { supabase } from '../../lib/supabase'
import type { NoteKind, NoteRow } from '../../types/database'

/** The most recent note from the partner that this user has not seen yet, if any. */
export async function fetchLatestUnseenNote(currentUserId: string): Promise<NoteRow | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .is('seen_at', null)
    .neq('created_by', currentUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function markNoteSeen(id: string): Promise<void> {
  const { error } = await supabase.from('notes').update({ seen_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function createNote(kind: NoteKind, content: string): Promise<NoteRow> {
  const { data, error } = await supabase.from('notes').insert({ kind, content }).select().single()
  if (error) throw error
  return data
}
