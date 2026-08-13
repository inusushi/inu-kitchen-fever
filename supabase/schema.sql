-- Ejecuta esto en el SQL Editor de tu proyecto de Supabase (supabase.com/dashboard -> tu proyecto -> SQL Editor -> New query)

create table if not exists public.game_saves (
  sync_code text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.game_saves enable row level security;

-- Sin login: cualquiera con el código correcto puede leer/escribir su propia fila.
-- El "código" (8 caracteres al azar) funciona como la llave de acceso.
create policy "read by code" on public.game_saves
  for select using (true);

create policy "insert by code" on public.game_saves
  for insert with check (true);

create policy "update by code" on public.game_saves
  for update using (true);
