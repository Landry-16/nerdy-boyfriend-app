import { supabase } from '../../lib/supabase'

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// Web Push wants the VAPID public key as a raw Uint8Array backed by a plain
// ArrayBuffer, but it is distributed (and stored in env vars) as a URL-safe
// base64 string. Uint8Array.from() types its result as Uint8Array<ArrayBufferLike>,
// which PushSubscriptionOptionsInit rejects, so this builds the array manually.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const output = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i)
  }
  return output
}

export type PushSubscribeResult = 'subscribed' | 'permission-denied' | 'unsupported'

/** Requests notification permission (if needed) and saves a push subscription for this device. */
export async function subscribeToPush(): Promise<PushSubscribeResult> {
  if (!isPushSupported()) return 'unsupported'

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'permission-denied'

  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
    }))

  const { p256dh, auth } = subscription.toJSON().keys ?? {}
  if (!p256dh || !auth) throw new Error('Push subscription is missing encryption keys.')

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ endpoint: subscription.endpoint, p256dh_key: p256dh, auth_key: auth }, { onConflict: 'endpoint' })

  if (error) throw error
  return 'subscribed'
}

export async function getNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}
