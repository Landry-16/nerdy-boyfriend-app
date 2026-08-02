// Hand-written types mirroring supabase/migrations/0001_init.sql.
// If the schema changes, update this file to match.
//
// Row/Insert/Update use `type` (not `interface`): the Supabase client
// generics require each table to structurally match Record<string, unknown>,
// which plain interfaces do not satisfy without an explicit index signature.

export type MessageType =
  | 'compliment'
  | 'memory'
  | 'quote'
  | 'joke'
  | 'encouragement'
  | 'declaration'

export type Mood = 'happy' | 'love' | 'tired' | 'sad' | 'angry' | 'crying'

export type MessageRow = {
  id: string
  text: string
  type: MessageType
  created_at: string
}

export type MoodRow = {
  id: string
  mood_date: string
  mood: Mood
  note: string | null
  created_at: string
}

export type EventRow = {
  id: string
  title: string
  event_date: string
  is_recurring: boolean
  created_at: string
}

export type CoupleSettingsRow = {
  id: true
  relationship_start_date: string
  updated_at: string
}

export type MemoryRow = {
  id: string
  title: string
  description: string | null
  memory_date: string
  location_name: string | null
  latitude: number | null
  longitude: number | null
  music_url: string | null
  created_at: string
}

export type MemoryPhotoRow = {
  id: string
  memory_id: string
  storage_path: string
  position: number
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      messages: {
        Row: MessageRow
        Insert: Omit<MessageRow, 'id' | 'created_at'>
        Update: Partial<Omit<MessageRow, 'id' | 'created_at'>>
        Relationships: []
      }
      moods: {
        Row: MoodRow
        Insert: Omit<MoodRow, 'id' | 'created_at'>
        Update: Partial<Omit<MoodRow, 'id' | 'created_at'>>
        Relationships: []
      }
      events: {
        Row: EventRow
        Insert: Omit<EventRow, 'id' | 'created_at'>
        Update: Partial<Omit<EventRow, 'id' | 'created_at'>>
        Relationships: []
      }
      couple_settings: {
        Row: CoupleSettingsRow
        Insert: Omit<CoupleSettingsRow, 'updated_at'>
        Update: Partial<Omit<CoupleSettingsRow, 'id' | 'updated_at'>>
        Relationships: []
      }
      memories: {
        Row: MemoryRow
        Insert: Omit<MemoryRow, 'id' | 'created_at'>
        Update: Partial<Omit<MemoryRow, 'id' | 'created_at'>>
        Relationships: []
      }
      memory_photos: {
        Row: MemoryPhotoRow
        Insert: Omit<MemoryPhotoRow, 'id' | 'created_at'>
        Update: Partial<Omit<MemoryPhotoRow, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
