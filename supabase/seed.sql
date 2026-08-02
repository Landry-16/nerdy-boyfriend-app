-- Example seed data. Safe to edit freely: replace these with your own
-- messages, mood history, and events once the schema is deployed.

insert into public.messages (text, type) values
  ('Chaque jour avec toi est une chance.', 'declaration'),
  ('Te souviens-tu de notre premiere sortie ensemble ?', 'memory'),
  ('Tu as le sourire le plus contagieux que je connaisse.', 'compliment'),
  ('L''amour, c''est trouver quelqu''un avec qui rire des memes betises.', 'quote'),
  ('Pourquoi les couples de developpeurs ne se disputent jamais ? Ils resolvent tout en pair programming.', 'joke'),
  ('Tu geres, meme les jours difficiles. Je crois en toi.', 'encouragement')
on conflict do nothing;

insert into public.couple_settings (id, relationship_start_date)
values (true, current_date)
on conflict (id) do nothing;
