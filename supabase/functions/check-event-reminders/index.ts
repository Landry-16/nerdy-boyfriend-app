// Scheduled to run once a day via pg_cron + pg_net (see README "Push
// notifications" for the exact SQL), not invoked by the client. Checks
// every event across every couple for two triggers: "today" and
// "approaching" (APPROACHING_DAYS out). notified_today_at / _approaching_at
// are compared against *today's date only*, not just "is it set", so a
// recurring event correctly gets notified again next year without any
// extra reset logic.
import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { sendPushToAll } from '../_shared/webpush.ts'

const APPROACHING_DAYS = 7

interface EventRow {
  id: string
  couple_id: string
  title: string
  event_date: string
  is_recurring: boolean
  notified_approaching_at: string | null
  notified_today_at: string | null
}

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret && req.headers.get('x-cron-secret') !== cronSecret) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data: events, error } = await supabase
    .from('events')
    .select('id, couple_id, title, event_date, is_recurring, notified_approaching_at, notified_today_at')

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let notifiedCount = 0

  for (const event of (events ?? []) as EventRow[]) {
    const daysUntil = daysUntilNextOccurrence(event.event_date, event.is_recurring, today)

    if (daysUntil === 0 && !isSameDay(event.notified_today_at, today)) {
      await notifyCouple(supabase, event.couple_id, {
        title: "Aujourd'hui !",
        body: `${event.title}, c'est aujourd'hui.`,
      })
      await supabase.from('events').update({ notified_today_at: new Date().toISOString() }).eq('id', event.id)
      notifiedCount++
    } else if (daysUntil === APPROACHING_DAYS && !isSameDay(event.notified_approaching_at, today)) {
      await notifyCouple(supabase, event.couple_id, {
        title: 'Ca approche',
        body: `${event.title}, c'est dans ${APPROACHING_DAYS} jours.`,
      })
      await supabase.from('events').update({ notified_approaching_at: new Date().toISOString() }).eq('id', event.id)
      notifiedCount++
    }
  }

  return new Response(JSON.stringify({ notified: notifiedCount }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

/** Days from `today` to the event's next occurrence (this year if recurring and not yet past, else next year). */
function daysUntilNextOccurrence(eventDate: string, isRecurring: boolean, today: Date): number {
  const [year, month, day] = eventDate.split('-').map(Number)
  let candidate = new Date(isRecurring ? today.getFullYear() : year, month - 1, day)
  candidate.setHours(0, 0, 0, 0)

  if (isRecurring && candidate.getTime() < today.getTime()) {
    candidate = new Date(today.getFullYear() + 1, month - 1, day)
  }

  const oneDayMs = 24 * 60 * 60 * 1000
  return Math.round((candidate.getTime() - today.getTime()) / oneDayMs)
}

function isSameDay(isoTimestamp: string | null, today: Date): boolean {
  if (!isoTimestamp) return false
  const date = new Date(isoTimestamp)
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

async function notifyCouple(
  supabase: SupabaseClient,
  coupleId: string,
  payload: { title: string; body: string },
): Promise<void> {
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh_key, auth_key')
    .eq('couple_id', coupleId)

  const deadIds = await sendPushToAll(subscriptions ?? [], payload)
  if (deadIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', deadIds)
  }
}
