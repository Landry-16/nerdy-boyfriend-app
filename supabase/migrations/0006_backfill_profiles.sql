-- 0003_couples.sql's handle_new_user trigger only creates a profiles row on
-- INSERT into auth.users, so any account that already existed before 0003
-- was applied - the original single shared-login account, in particular -
-- never got one. That account can still authenticate (auth.users is
-- untouched) but the app could never get past the profile lookup: it
-- returned zero rows, which used to throw inside an unawaited effect and
-- leave the app stuck on the loading screen forever (see the ProfileContext
-- fix alongside this migration). Backfill is idempotent, safe to re-run.
--
-- Backfilled profiles are linked straight to the legacy couple (fixed id
-- '00000000-0000-0000-0000-000000000001', see 0003_couples.sql): a
-- pre-existing account, by definition, predates individual accounts
-- entirely, so it can only be the original shared-login user, and that
-- user's data is exactly what the legacy couple already holds.

insert into public.profiles (id, display_name, couple_id)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'display_name', split_part(u.email, '@', 1)),
  '00000000-0000-0000-0000-000000000001'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
