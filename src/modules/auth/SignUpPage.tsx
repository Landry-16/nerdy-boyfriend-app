import { useState, type FormEvent } from 'react'
import { useAuth } from './AuthContext'

export function SignUpPage({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const { signUp } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const signedInImmediately = await signUp(email, password, displayName)
      // If email confirmation is off, the new session flows through
      // RequireAuth automatically and this component unmounts; only show
      // the "check your email" screen when confirmation is required.
      if (!signedInImmediately) setSubmitted(true)
    } catch {
      setError('Impossible de creer le compte. Cet email est peut-etre deja utilise.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-cream px-6">
        <div className="w-full max-w-sm animate-fade-in space-y-3 text-center">
          <h1 className="text-2xl font-semibold text-ink">Presque pret !</h1>
          <p className="text-sm text-ink/70">
            Verifie ta boite mail pour confirmer ton adresse, puis connecte-toi.
          </p>
          <button type="button" onClick={onSwitchToLogin} className="text-sm text-sage-dark underline underline-offset-2">
            Retour a la connexion
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm animate-fade-in space-y-5 text-center">
        <h1 className="text-3xl font-semibold text-ink">Nous 🫶</h1>
        <p className="text-sm text-ink/70">Cree ton compte</p>

        <div className="space-y-3 text-left">
          <label className="block text-sm font-medium text-ink" htmlFor="display-name">
            Ton prenom
          </label>
          <input
            id="display-name"
            type="text"
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-sage"
          />

          <label className="block text-sm font-medium text-ink" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-sage"
          />

          <label className="block text-sm font-medium text-ink" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-sage"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-sage px-4 py-3 font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
        >
          {submitting ? 'Creation...' : 'Creer mon compte'}
        </button>

        <button type="button" onClick={onSwitchToLogin} className="text-xs text-ink/50 underline underline-offset-2">
          Deja un compte ? Se connecter
        </button>
      </form>
    </main>
  )
}
