import { useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { ProfileProvider } from './ProfileContext'
import { LoginPage } from './LoginPage'
import { SignUpPage } from './SignUpPage'
import { PairingGate } from '../pairing/PairingGate'
import { LoadingScreen } from '../../components/LoadingScreen'

type AuthMode = 'login' | 'signup'

/**
 * Full gate in front of the app: signed out -> login/signup, signed in but
 * not paired -> PairingGate (create/join a couple), paired -> children.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')

  if (loading) return <LoadingScreen />

  if (!session) {
    return mode === 'login' ? (
      <LoginPage onSwitchToSignUp={() => setMode('signup')} />
    ) : (
      <SignUpPage onSwitchToLogin={() => setMode('login')} />
    )
  }

  return (
    <ProfileProvider>
      <PairingGate>{children}</PairingGate>
    </ProfileProvider>
  )
}
