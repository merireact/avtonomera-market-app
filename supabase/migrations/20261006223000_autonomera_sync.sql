-- Связь каталога мини-приложения с объявлениями autonomera777 (user_id 55597).
alter table public.numbers
  add column if not exists external_id text,
  add column if not exists source text;

create unique index if not exists numbers_external_id_unique
  on public.numbers (external_id)
  where external_id is not null;

create table if not exists public.catalog_sync (
  id int primary key,
  started_at timestamptz,
  finished_at timestamptz,
  status text,
  added int,
  updated int,
  removed int,
  error text
);

insert into public.catalog_sync (id, status)
values (1, 'idle')
on conflict (id) do nothing;

alter table public.catalog_sync enable row level security;
