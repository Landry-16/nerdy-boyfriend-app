// Invoked directly by the client right after it creates a note, memory, or
// event (see src/lib/notify.ts), as a fire-and-forget side effect - not by a
// database trigger. That keeps setup to "deploy this function", with no
// Database Webhook / pg_net wiring to configure separately.
//
// The couple_id is never taken from the request body: it is resolved
// server-side from the caller's own JWT, so a client cannot ask this
// function to push notifications to a couple it does not belong to.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { sendPushToAll, type PushPayload } from '../_shared/webpush.ts'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Missing Authorization header', { status: 401 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // Scoped to the caller's own JWT: RLS resolves *their* profile only.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
  } = await callerClient.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: profile } = await callerClient.from('profiles').select('couple_id').eq('id', user.id).maybeSingle()
  if (!profile?.couple_id) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: { 'Content-Type': 'application/json' } })
  }

  let payload: PushPayload
  try {
    payload = await req.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }
  if (!payload.title || !payload.body) {
    return new Response('title and body are required', { status: 400 })
  }

  // Service role from here on: reading another user's (the partner's) push
  // subscription rows is exactly what RLS forbids the client from doing.
  const serviceClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: subscriptions, error } = await serviceClient
    .from('push_subscriptions')
    .select('id, endpoint, p256dh_key, auth_key')
    .eq('couple_id', profile.couple_id)
    .neq('user_id', user.id)

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  const deadIds = await sendPushToAll(subscriptions ?? [], payload)
  if (deadIds.length > 0) {
    await serviceClient.from('push_subscriptions').delete().in('id', deadIds)
  }

  return new Response(JSON.stringify({ sent: (subscriptions ?? []).length - deadIds.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
