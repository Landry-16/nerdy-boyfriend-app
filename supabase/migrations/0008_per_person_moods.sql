-- Moods move from one shared entry per couple per day to one entry per
-- person per day: each partner records their own mood, and both show up
-- together in the calendar view. created_by (added in 0003_couples.sql)
-- becomes the actual identity of an entry here, not just attribution.
--
-- Rows from before individual accounts existed have created_by = null.
-- That is compatible with the new constraint as-is (null never conflicts
-- with anything in a unique constraint), so no backfill is needed; those
-- entries just do not attribute to a specific person in the calendar.

alter table public.moods drop constraint moods_couple_id_mood_date_key;
alter table public.moods add constraint moods_created_by_mood_date_key unique (created_by, mood_date);
