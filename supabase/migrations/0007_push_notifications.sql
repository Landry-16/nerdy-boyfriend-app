-- Web Push subscriptions, one row per device/browser a user has enabled
-- notifications on. Sending itself happens outside Postgres, in Edge
-- Functions (supabase/functions/) using the service role key, which bypass
-- RLS entirely - a user only ever sees their own subscription rows here,
-- never their partner's (their raw push endpoint/keys are not couple data).

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  couple_id uuid not null references public.couples (id) on delete cascade default public.current_couple_id(),
  endpoint text not null unique,
  p256dh_key text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "Users can read own push subscriptions" on public.push_subscriptions
  for select to authenticated using (user_id = auth.uid());
create policy "Users can create own push subscriptions" on public.push_subscriptions
  for insert to authenticated with check (user_id = auth.uid());
create policy "Users can delete own push subscriptions" on public.push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

grant select, insert, delete on table public.push_subscriptions to authenticated;

-- Dedup markers so the daily reminder check (check-event-reminders Edge
-- Function) does not re-notify for the same occurrence if it runs more than
-- once in a day, or notify again next year for a recurring event until its
-- next real occurrence resets these.
alter table public.events add column notified_approaching_at timestamptz;
alter table public.events add column notified_today_at timestamptz;
