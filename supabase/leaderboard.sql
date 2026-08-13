-- Ejecuta esto en el SQL Editor de tu proyecto de Supabase.
-- Tabla de récords global de Inu Kitchen Fever.

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  level_id text not null,
  nickname text not null check (char_length(nickname) between 2 and 16),
  coins integer not null check (coins >= 0),
  stars integer not null check (stars between 0 and 3),
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_level_coins_idx
  on public.leaderboard (level_id, coins desc);

alter table public.leaderboard enable row level security;

-- El juego no tiene login: cualquiera puede leer la tabla y publicar su marca.
-- Nadie puede modificar ni borrar marcas ajenas (no hay policy de update ni
-- de delete, así que quedan prohibidas por defecto).
create policy "leaderboard readable by anyone" on public.leaderboard
  for select using (true);

create policy "anyone can post a score" on public.leaderboard
  for insert with check (
    char_length(nickname) between 2 and 16
    and coins >= 0
    and stars between 0 and 3
  );
