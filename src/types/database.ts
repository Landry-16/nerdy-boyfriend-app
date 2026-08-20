// Hand-written types mirroring supabase/migrations/*.sql.
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

export type CoupleRow = {
  id: string
  invite_code: string
  created_at: string
}

export type ProfileRow = {
  id: string
  couple_id: string | null
  display_name: string
  created_at: string
}

export type MessageRow = {
  id: string
  text: string
  type: MessageType
  couple_id: string
  created_by: string | null
  created_at: string
}

export type MoodRow = {
  id: string
  mood_date: string
  mood: Mood
  note: string | null
  couple_id: string
  created_by: string | null
  created_at: string
}

export type EventRow = {
  id: string
  title: string
  event_date: string
  is_recurring: boolean
  couple_id: string
  created_by: string | null
  notified_approaching_at: string | null
  notified_today_at: string | null
  created_at: string
}

export type CoupleSettingsRow = {
  id: string
  couple_id: string
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
  couple_id: string
  created_by: string | null
  created_at: string
}

export type MemoryPhotoRow = {
  id: string
  memory_id: string
  storage_path: string
  position: number
  created_at: string
}

export type NoteKind = 'text' | 'drawing'

export type NoteRow = {
  id: string
  couple_id: string
  created_by: string | null
  kind: NoteKind
  content: string
  seen_at: string | null
  created_at: string
}

export type BrowseRoomRow = {
  id: string
  couple_id: string
  current_url: string | null
  updated_by: string | null
  updated_at: string
}

export type PushSubscriptionRow = {
  id: string
  user_id: string
  couple_id: string
  endpoint: string
  p256dh_key: string
  auth_key: string
  created_at: string
}

export type FoodTypeRow = {
  id: string
  couple_id: string
  created_by: string | null
  label: string
  cuisine_tag: string
  created_at: string
}

// couple_id and created_by are stamped server-side via column defaults
// (public.current_couple_id() / auth.uid(), see 0003_couples.sql), so
// callers never need to supply them on insert.
type InsertOf<Row extends { id: unknown; created_at: unknown }, Defaulted extends keyof Row = never> = Omit<
  Row,
  'id' | 'created_at' | Defaulted
> &
  Partial<Pick<Row, Defaulted>>

export type Database = {
  public: {
    Tables: {
      couples: {
        Row: CoupleRow
        Insert: Omit<CoupleRow, 'id' | 'created_at'>
        Update: Partial<Omit<CoupleRow, 'id' | 'created_at'>>
        Relationships: []
      }
      profiles: {
        Row: ProfileRow
        Insert: Omit<ProfileRow, 'created_at'>
        Update: Partial<Omit<ProfileRow, 'id' | 'created_at'>>
        Relationships: []
      }
      messages: {
        Row: MessageRow
        Insert: InsertOf<MessageRow, 'couple_id' | 'created_by'>
        Update: Partial<Omit<MessageRow, 'id' | 'created_at'>>
        Relationships: []
      }
      moods: {
        Row: MoodRow
        Insert: InsertOf<MoodRow, 'couple_id' | 'created_by'>
        Update: Partial<Omit<MoodRow, 'id' | 'created_at'>>
        Relationships: []
      }
      events: {
        Row: EventRow
        Insert: InsertOf<EventRow, 'couple_id' | 'created_by' | 'notified_approaching_at' | 'notified_today_at'>
        Update: Partial<Omit<EventRow, 'id' | 'created_at'>>
        Relationships: []
      }
      couple_settings: {
        Row: CoupleSettingsRow
        Insert: Omit<CoupleSettingsRow, 'id' | 'updated_at' | 'couple_id'> & Partial<Pick<CoupleSettingsRow, 'couple_id'>>
        Update: Partial<Omit<CoupleSettingsRow, 'id' | 'updated_at'>>
        Relationships: []
      }
      memories: {
        Row: MemoryRow
        Insert: InsertOf<MemoryRow, 'couple_id' | 'created_by'>
        Update: Partial<Omit<MemoryRow, 'id' | 'created_at'>>
        Relationships: []
      }
      memory_photos: {
        Row: MemoryPhotoRow
        Insert: Omit<MemoryPhotoRow, 'id' | 'created_at'>
        Update: Partial<Omit<MemoryPhotoRow, 'id' | 'created_at'>>
        Relationships: []
      }
      notes: {
        Row: NoteRow
        Insert: InsertOf<NoteRow, 'couple_id' | 'created_by' | 'seen_at'>
        Update: Partial<Omit<NoteRow, 'id' | 'created_at'>>
        Relationships: []
      }
      browse_room: {
        Row: BrowseRoomRow
        Insert: Omit<BrowseRoomRow, 'id' | 'updated_at' | 'couple_id' | 'updated_by'> &
          Partial<Pick<BrowseRoomRow, 'couple_id' | 'updated_by'>>
        Update: Partial<Omit<BrowseRoomRow, 'id' | 'updated_at'>>
        Relationships: []
      }
      push_subscriptions: {
        Row: PushSubscriptionRow
        Insert: InsertOf<PushSubscriptionRow, 'user_id' | 'couple_id'>
        Update: Partial<Omit<PushSubscriptionRow, 'id' | 'created_at'>>
        Relationships: []
      }
      food_types: {
        Row: FoodTypeRow
        Insert: InsertOf<FoodTypeRow, 'couple_id' | 'created_by'>
        Update: Partial<Omit<FoodTypeRow, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      create_couple: {
        Args: Record<string, never>
        Returns: CoupleRow
      }
      join_couple_by_code: {
        Args: { code: string }
        Returns: CoupleRow
      }
    }
  }
}
