import { useState, type FormEvent } from 'react'
import { useProfile } from '../auth/ProfileContext'
import { useAuth } from '../auth/AuthContext'

export function CreateOrJoinCouple() {
  const { createCouple, joinCouple } = useProfile()
  const { signOut } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'create' | 'join' | null>(null)

  async function handleCreate() {
    setError(null)
    setBusy('create')
    try {
      await createCouple()
    } catch {
      setError("Impossible de creer le couple.")
    } finally {
      setBusy(null)
    }
  }

  async function handleJoin(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setBusy('join')
    try {
      await joinCouple(code)
    } catch (joinError) {
      // Supabase's PostgrestError is typed as extending Error, but at
      // runtime it is a plain { code, message, ... } object that fails an
      // `instanceof Error` check, so read `.message` directly instead.
      const message = typeof joinError === 'object' && joinError !== null && 'message' in joinError
        ? String(joinError.message)
        : ''
      if (message.includes('couple_full')) setError('Ce couple a deja 2 membres.')
      else if (message.includes('invalid_code')) setError('Code invalide.')
      else setError('Impossible de rejoindre ce couple.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm animate-fade-in space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Presque pret</h1>
          <p className="mt-1 text-sm text-ink/60">Cree votre couple ou rejoins celui de ton/ta partenaire.</p>
        </div>

        <div className="space-y-3 rounded-3xl bg-white/70 p-6">
          <p className="text-sm font-medium text-ink">Nouveau couple</p>
          <p className="text-xs text-ink/60">Tu obtiendras un code a partager avec ton/ta partenaire.</p>
          <button
            type="button"
            onClick={handleCreate}
            disabled={busy !== null}
            className="w-full rounded-2xl bg-sage px-4 py-3 font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
          >
            {busy === 'create' ? 'Creation...' : 'Creer notre couple'}
          </button>
        </div>

        <form onSubmit={handleJoin} className="space-y-3 rounded-3xl bg-white/70 p-6">
          <p className="text-sm font-medium text-ink">J'ai deja un code</p>
          <input
            type="text"
            required
            placeholder="Code a 6 caracteres"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            maxLength={6}
            className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-center tracking-widest text-ink outline-none focus:border-sage"
          />
          <button
            type="submit"
            disabled={busy !== null}
            className="w-full rounded-2xl bg-sky px-4 py-3 font-medium text-ink transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {busy === 'join' ? 'Connexion...' : 'Rejoindre'}
          </button>
        </form>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="button" onClick={() => void signOut()} className="text-xs text-ink/40 underline underline-offset-2">
          Deconnexion
        </button>
      </div>
    </main>
  )
}
