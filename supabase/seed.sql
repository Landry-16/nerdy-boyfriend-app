-- Example seed data. Safe to edit freely: replace these with your own
-- messages once you have a couple.
--
-- messages.couple_id has no useful default at fresh-install time (nobody
-- has signed up and paired yet), so this seeds the oldest existing couple,
-- if any, and does nothing otherwise. Run this again (or paste it into the
-- SQL editor) any time after creating your couple to load example content.

insert into public.messages (text, type, couple_id)
select m.text, m.type, c.id
from (
  values
    ('Chaque jour avec toi est une chance.', 'declaration'),
    ('Tu te souviens de notre premiere sortie ensemble ?', 'memory'),
    ('Tu as le sourire le plus contagieux que je connaisse.', 'compliment'),
    ('Tes sourcils', 'joke'),
    ('Je crois en toi', 'encouragement'),
    ('Je suis convaincu que tu geres, meme les jours difficiles.', 'encouragement')
) as m (text, type)
cross join (select id from public.couples order by created_at limit 1) as c;
