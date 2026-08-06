import { supabase } from '../../lib/supabase'
import type { MemoryPhotoRow, MemoryRow } from '../../types/database'

const PHOTO_BUCKET = 'memory-photos'

export type MemoryWithPhotos = MemoryRow & { photos: MemoryPhotoRow[] }
export type NewMemoryInput = Omit<MemoryRow, 'id' | 'created_at' | 'couple_id' | 'created_by'>

export function getPhotoUrl(storagePath: string): string {
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(storagePath).data.publicUrl
}

export async function fetchMemories(): Promise<MemoryWithPhotos[]> {
  const [memoriesResult, photosResult] = await Promise.all([
    supabase.from('memories').select('*').order('memory_date', { ascending: false }),
    supabase.from('memory_photos').select('*').order('position', { ascending: true }),
  ])

  if (memoriesResult.error) throw memoriesResult.error
  if (photosResult.error) throw photosResult.error

  return memoriesResult.data.map((memory) => ({
    ...memory,
    photos: photosResult.data.filter((photo) => photo.memory_id === memory.id),
  }))
}

export async function fetchMemory(id: string): Promise<MemoryWithPhotos> {
  const [memoryResult, photosResult] = await Promise.all([
    supabase.from('memories').select('*').eq('id', id).single(),
    supabase.from('memory_photos').select('*').eq('memory_id', id).order('position', { ascending: true }),
  ])

  if (memoryResult.error) throw memoryResult.error
  if (photosResult.error) throw photosResult.error

  return { ...memoryResult.data, photos: photosResult.data }
}

async function uploadMemoryPhoto(memoryId: string, file: File, position: number): Promise<MemoryPhotoRow> {
  const extension = file.name.split('.').pop() ?? 'jpg'
  const storagePath = `${memoryId}/${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage.from(PHOTO_BUCKET).upload(storagePath, file)
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('memory_photos')
    .insert({ memory_id: memoryId, storage_path: storagePath, position })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createMemory(input: NewMemoryInput, files: File[]): Promise<MemoryWithPhotos> {
  const { data: memory, error } = await supabase.from('memories').insert(input).select().single()
  if (error) throw error

  const photos = await Promise.all(files.map((file, index) => uploadMemoryPhoto(memory.id, file, index)))
  return { ...memory, photos }
}

export async function deleteMemory(memory: MemoryWithPhotos): Promise<void> {
  if (memory.photos.length > 0) {
    await supabase.storage.from(PHOTO_BUCKET).remove(memory.photos.map((photo) => photo.storage_path))
  }

  const { error } = await supabase.from('memories').delete().eq('id', memory.id)
  if (error) throw error
}
