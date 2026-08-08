import { supabase } from './supabase'

/**
 * Fires the send-push Edge Function so the partner gets a push notification.
 * Best-effort: a notification failing to send should never block the
 * action that triggered it (saving a note, memory, or event), so errors
 * are swallowed here rather than surfaced to the caller.
 */
export function notifyPartner(title: string, body: string, url?: string): void {
  void supabase.functions.invoke('send-push', { body: { title, body, url } }).catch((error: unknown) => {
    console.error('Failed to send push notification', error)
  })
}
