import { supabase } from '../../lib/supabase'
import type { BrowseRoomRow } from '../../types/database'

export async function fetchRoom(): Promise<BrowseRoomRow | null> {
  const { data, error } = await supabase.from('browse_room').select('*').maybeSingle()
  if (error) throw error
  return data
}

export async function setRoomUrl(url: string): Promise<BrowseRoomRow> {
  const { data, error } = await supabase
    .from('browse_room')
    .upsert({ current_url: url }, { onConflict: 'couple_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

/** Subscribes to live changes on the couple's room. Returns an unsubscribe function. */
export function subscribeToRoom(coupleId: string, onChange: (room: BrowseRoomRow) => void): () => void {
  const channel = supabase
    .channel(`browse_room:${coupleId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'browse_room', filter: `couple_id=eq.${coupleId}` },
      (payload) => onChange(payload.new as BrowseRoomRow),
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
