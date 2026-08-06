import { supabase } from '../../lib/supabase'
import type { CoupleRow } from '../../types/database'

export async function fetchCouple(coupleId: string): Promise<CoupleRow> {
  const { data, error } = await supabase.from('couples').select('*').eq('id', coupleId).single()
  if (error) throw error
  return data
}

export async function fetchCoupleMemberCount(coupleId: string): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('couple_id', coupleId)

  if (error) throw error
  return count ?? 0
}
