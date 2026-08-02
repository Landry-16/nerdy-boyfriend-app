import { useCallback } from 'react'
import { useAsync } from '../../lib/useAsync'
import { fetchMessages } from './messages.api'
import { messageTypeLabels } from './messageTypes'
import { LoadingScreen } from '../../components/LoadingScreen'
import { ErrorMessage } from '../../components/ErrorMessage'

export function MessagesPage() {
  const fetcher = useCallback(fetchMessages, [])
  const { data: messages, loading, error } = useAsync(fetcher)

  if (loading) return <LoadingScreen />
  if (error || !messages) return <ErrorMessage message="Impossible de charger les messages." />

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Historique des messages</h1>
        <p className="text-sm text-ink/60">{messages.length} message(s) dans la collection.</p>
      </header>

      <ul className="space-y-3">
        {messages.map((message) => (
          <li key={message.id} className="rounded-2xl bg-white/70 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-sage-dark">
              {messageTypeLabels[message.type]}
            </span>
            <p className="mt-1 text-sm text-ink">{message.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
