import { supabase } from '../../lib/supabase'
import type { FoodTypeRow } from '../../types/database'

export async function fetchCustomFoodTypes(): Promise<FoodTypeRow[]> {
  const { data, error } = await supabase.from('food_types').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function addFoodType(label: string): Promise<FoodTypeRow> {
  const { data, error } = await supabase
    .from('food_types')
    .insert({ label, cuisine_tag: label.toLowerCase() })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeFoodType(id: string): Promise<void> {
  const { error } = await supabase.from('food_types').delete().eq('id', id)
  if (error) throw error
}
