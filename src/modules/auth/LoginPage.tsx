import { useState, type FormEvent } from 'react'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn(email, password)
    } catch {
      setError('Identifiants incorrects.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-cream px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm animate-fade-in space-y-5 text-center">
        <h1 className="text-3xl font-semibold text-ink">Nous 🫶</h1>
        <p className="text-sm text-ink/70">Notre espace personnel partage.</p>

        <div className="space-y-3 text-left">
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
          {submitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </main>
  )
}
