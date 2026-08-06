import { useCallback, type ReactNode } from 'react'
import { useProfile } from '../auth/ProfileContext'
import { useAsync } from '../../lib/useAsync'
import { fetchCouple, fetchCoupleMemberCount } from './pairing.api'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ErrorMessage } from '../../components/ErrorMessage'
import { CreateOrJoinCouple } from './CreateOrJoinCouple'
import { WaitingForPartner } from './WaitingForPartner'

interface CoupleStatus {
  inviteCode: string
  memberCount: number
}

/**
 * Renders `children` (the app) only once the signed-in user has paired into
 * a couple with exactly 2 members. Otherwise shows the create/join screen,
 * or a waiting screen with the invite code while a partner has not joined
 * yet.
 */
export function PairingGate({ children }: { children: ReactNode }) {
  const { profile, loading: profileLoading } = useProfile()
  const coupleId = profile?.couple_id ?? null

  const fetcher = useCallback(async (): Promise<CoupleStatus | null> => {
    if (!coupleId) return null
    const [couple, memberCount] = await Promise.all([fetchCouple(coupleId), fetchCoupleMemberCount(coupleId)])
    return { inviteCode: couple.invite_code, memberCount }
  }, [coupleId])

  const { data: status, loading: statusLoading, error, refetch } = useAsync(fetcher)

  if (profileLoading || statusLoading) return <LoadingScreen />
  if (!profile) return <ErrorMessage message="Impossible de charger le profil." />
  if (!coupleId) return <CreateOrJoinCouple />
  if (error || !status) return <ErrorMessage message="Impossible de charger le couple." />

  if (status.memberCount < 2) {
    return <WaitingForPartner inviteCode={status.inviteCode} onCheckAgain={refetch} />
  }

  return <>{children}</>
}
