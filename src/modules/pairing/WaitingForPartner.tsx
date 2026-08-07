import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'

export function WaitingForPartner({ inviteCode, onCheckAgain }: { inviteCode: string; onCheckAgain: () => void }) {
  const { signOut } = useAuth()
  const [copied, setCopied] = useState(false)

  // Light polling so the waiting screen advances on its own once the
  // partner joins, without needing a full realtime subscription.
  useEffect(() => {
    const interval = setInterval(onCheckAgain, 4000)
    return () => clearInterval(interval)
  }, [onCheckAgain])

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm animate-fade-in space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Maintenant on attend</h1>
          <p className="mt-1 text-sm text-ink/60">Code tres magique tres genial qui permet de se lier</p>
        </div>

        <div className="space-y-3 rounded-3xl bg-white/70 p-6">
          <p className="text-4xl font-semibold tracking-[0.3em] text-sage-dark">{inviteCode}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full rounded-2xl bg-sage px-4 py-3 font-medium text-white transition-colors hover:bg-sage-dark"
          >
            {copied ? 'Copie !' : 'Copier le code'}
          </button>
        </div>

        <button type="button" onClick={onCheckAgain} className="text-xs text-ink/50 underline underline-offset-2">
          Verifier maintenant
        </button>

        <div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-xs text-ink/40 underline underline-offset-2"
          >
            Deconnexion
          </button>
        </div>
      </div>
    </main>
  )
}
