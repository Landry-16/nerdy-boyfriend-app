import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import type { ProfileRow } from '../../types/database'
import { useAuth } from './AuthContext'

interface ProfileContextValue {
  profile: ProfileRow | null
  loading: boolean
  refetch: () => Promise<void>
  createCouple: () => Promise<void>
  joinCouple: (code: string) => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

/**
 * Tracks the signed-in user's own profile row, including whether they have
 * paired into a couple yet (profile.couple_id). Pairing itself happens
 * through Postgres functions (see 0003_couples.sql) so the "already paired"
 * and "couple is full" rules are enforced server-side, not just in the UI.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const userId = session?.user.id ?? null

  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // maybeSingle, not single: a signed-in user with no matching profiles
      // row (should not happen post-migration, but is a real failure mode
      // worth degrading gracefully from) must resolve to null, not throw -
      // otherwise loading never clears and the app hangs on a spinner forever.
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      if (error) throw error
      setProfile(data)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function createCouple() {
    const { error } = await supabase.rpc('create_couple')
    if (error) throw error
    await refetch()
  }

  async function joinCouple(code: string) {
    const { error } = await supabase.rpc('join_couple_by_code', { code })
    if (error) throw error
    await refetch()
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, refetch, createCouple, joinCouple }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile must be used within a ProfileProvider')
  return context
}
