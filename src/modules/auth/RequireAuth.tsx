import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { LoginPage } from './LoginPage'
import { LoadingScreen } from '../../components/LoadingScreen'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) return <LoadingScreen />
  if (!session) return <LoginPage />

  return children
}
