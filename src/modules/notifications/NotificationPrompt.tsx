import { useEffect, useState } from 'react'
import { getNotificationPermission, subscribeToPush } from './push'
import { Card } from '../../components/Card'

const DISMISSED_KEY = 'nous:notification-prompt-dismissed'

/** A dismissible prompt to enable push notifications. Renders nothing once enabled, dismissed, or unsupported. */
export function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported' | null>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === 'true')
  const [subscribing, setSubscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getNotificationPermission().then(setPermission)
  }, [])

  if (!permission || permission === 'unsupported' || permission === 'granted' || dismissed) return null

  async function handleEnable() {
    setError(null)
    setSubscribing(true)
    try {
      const result = await subscribeToPush()
      if (result === 'subscribed') {
        setPermission('granted')
      } else if (result === 'permission-denied') {
        setPermission('denied')
      }
    } catch {
      setError('Impossible d\'activer les notifications.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <Card className="animate-fade-in space-y-3 text-center">
      <p className="text-sm text-ink/70">
        Active les notifications pour savoir quand elle t'ecrit un petit mot, ajoute un souvenir, ou qu'un evenement
        approche.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(DISMISSED_KEY, 'true')
            setDismissed(true)
          }}
          className="flex-1 rounded-2xl bg-beige/60 px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-beige"
        >
          Plus tard
        </button>
        <button
          type="button"
          onClick={() => void handleEnable()}
          disabled={subscribing}
          className="flex-1 rounded-2xl bg-sage px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
        >
          {subscribing ? 'Activation...' : 'Activer'}
        </button>
      </div>
    </Card>
  )
}
