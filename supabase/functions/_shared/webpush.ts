// Shared by send-push and check-event-reminders. Uses the well-tested
// `web-push` npm package (via Deno's npm compatibility) rather than
// hand-rolling the Web Push encryption/VAPID signing spec.
import webpush from 'npm:web-push@3.6.7'

const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
const vapidSubject = Deno.env.get('VAPID_SUBJECT')

if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
  throw new Error('VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT must be set as Edge Function secrets.')
}

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

export interface PushSubscriptionRecord {
  id: string
  endpoint: string
  p256dh_key: string
  auth_key: string
}

export interface PushPayload {
  title: string
  body: string
  url?: string
}

/**
 * Sends a push to every subscription, best-effort. Returns the ids of
 * subscriptions the push service reports as gone (404/410), so the caller
 * can delete them - browsers and OSes expire subscriptions silently.
 */
export async function sendPushToAll(
  subscriptions: PushSubscriptionRecord[],
  payload: PushPayload,
): Promise<string[]> {
  const deadSubscriptionIds: string[] = []

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh_key, auth: sub.auth_key } },
          JSON.stringify(payload),
        )
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode
        if (statusCode === 404 || statusCode === 410) {
          deadSubscriptionIds.push(sub.id)
        } else {
          console.error('Push failed for subscription', sub.id, error)
        }
      }
    }),
  )

  return deadSubscriptionIds
}
