import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  /** Returns true if the account is signed in immediately (email confirmation off). */
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Each person has their own Supabase Auth account (see README
 * "Authentication"). Two accounts pair up into a couple separately, tracked
 * by ProfileContext, not here.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        // Without this, the confirmation email links back to whatever
        // "Site URL" is set in the Supabase dashboard - a fresh project
        // defaults that to http://localhost:3000, which is wrong in
        // production. window.location.origin is correct in both local dev
        // and prod. Supabase-js auto-detects the token in this URL on load
        // (detectSessionInUrl, on by default), so no callback route is needed.
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) throw error
    return data.session !== null
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
