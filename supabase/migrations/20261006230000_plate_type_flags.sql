-- Отметки «Авто» и «Иные» ставит админ. По умолчанию ни один номер не отмечен.
alter table public.numbers
  add column if not exists is_auto boolean not null default false,
  add column if not exists is_other boolean not null default false;
