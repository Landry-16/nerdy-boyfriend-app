import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DailyMessageCard } from '../messages/DailyMessageCard'
import { CounterSummaryCard } from './CounterSummaryCard'
import { formatDateLong } from '../../lib/date'

export function HomePage() {
  const { signOut } = useAuth()

  return (
    <div className="animate-fade-in space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Nous 🫶</h1>
          <p className="mt-1 text-sm text-ink/60">{formatDateLong(new Date())}</p>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="text-xs text-ink/40 underline underline-offset-2"
        >
          Deconnexion
        </button>
      </header>

      <DailyMessageCard />
      <CounterSummaryCard />

      <Link
        to="/mood"
        className="block rounded-3xl bg-white/70 p-5 text-center text-sm text-ink/70 shadow-sm transition-transform hover:scale-[1.01]"
      >
        Comment tu te sens aujourd'hui ?
      </Link>
    </div>
  )
}
