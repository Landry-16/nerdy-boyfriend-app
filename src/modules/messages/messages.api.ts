import { supabase } from '../../lib/supabase'
import type { MessageRow } from '../../types/database'

export async function fetchMessages(): Promise<MessageRow[]> {
  const { data, error } = await supabase.from('messages').select('*')

  if (error) throw error
  return data
}
