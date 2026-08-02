-- Example seed data. Safe to edit freely: replace these with your own
-- messages, mood history, and events once the schema is deployed.

insert into public.messages (text, type) values
  ('Chaque jour avec toi est une chance.', 'declaration'),
  ('Tu te souviens de notre premiere sortie ensemble ?', 'memory'),
  ('Tu as le sourire le plus contagieux que je connaisse.', 'compliment'),
  ('Tes sourcils', 'joke'),
  ('Je crois en toi', 'encouragement'),
  ('Je suis convaincu que tu geres, meme les jours difficiles.', 'encouragement')
on conflict do nothing;

insert into public.couple_settings (id, relationship_start_date)
values (true, current_date)
on conflict (id) do nothing;
