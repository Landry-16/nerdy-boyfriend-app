import { useCallback } from 'react'
import { useAsync } from '../../lib/useAsync'
import { fetchMessages } from './messages.api'
import { getDailyMessage } from './dailyMessage'
import { messageTypeLabels } from './messageTypes'
import { Card } from '../../components/Card'
import { ErrorMessage } from '../../components/ErrorMessage'

export function DailyMessageCard() {
  const fetcher = useCallback(fetchMessages, [])
  const { data: messages, loading, error } = useAsync(fetcher)

  if (loading) {
    return <Card className="h-28 animate-pulse" />
  }

  if (error || !messages) {
    return <ErrorMessage message="Impossible de charger le message du jour." />
  }

  const message = getDailyMessage(messages)

  if (!message) {
    return (
      <Card>
        <p className="text-sm text-ink/60">Aucun message pour le moment.</p>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in text-center">
      <span className="text-xs font-medium uppercase tracking-wide text-sage-dark">
        {messageTypeLabels[message.type]}
      </span>
      <p className="mt-2 text-lg leading-relaxed text-ink">{message.text}</p>
    </Card>
  )
}
