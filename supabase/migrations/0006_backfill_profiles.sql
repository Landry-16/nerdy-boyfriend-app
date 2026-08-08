-- 0003_couples.sql's handle_new_user trigger only creates a profiles row on
-- INSERT into auth.users, so any account that already existed before 0003
-- was applied - the original single shared-login account, in particular -
-- never got one. That account can still authenticate (auth.users is
-- untouched) but the app could never get past the profile lookup: it
-- returned zero rows, which used to throw inside an unawaited effect and
-- leave the app stuck on the loading screen forever (see the ProfileContext
-- fix alongside this migration). Backfill is idempotent, safe to re-run.
--
-- couple_id is left null, same as a brand new signup: it is not assumed
-- that a pre-existing account should rejoin the legacy couple's data. If
-- that is what you want for your own orphaned account, link it explicitly:
--
--   update public.profiles set couple_id = '00000000-0000-0000-0000-000000000001'
--   where id = '<the account''s auth.users id>';

insert into public.profiles (id, display_name)
select u.id, coalesce(u.raw_user_meta_data ->> 'display_name', split_part(u.email, '@', 1))
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
