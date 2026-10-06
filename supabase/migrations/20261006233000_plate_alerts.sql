-- Заявки «Жду номер»: человек оставляет номер, которого нет в каталоге.
-- Когда номер появляется со статусом «Свободен», триггер пишет ему в Telegram.
create extension if not exists pg_net;

create table if not exists public.plate_alerts (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint not null,
  telegram_username text,
  plate text not null,
  plate_key text not null,
  created_at timestamptz default now(),
  notified_at timestamptz
);

create unique index if not exists plate_alerts_active_unique
  on public.plate_alerts (telegram_user_id, plate_key)
  where notified_at is null;

create index if not exists plate_alerts_plate_key_idx
  on public.plate_alerts (plate_key)
  where notified_at is null;

alter table public.plate_alerts enable row level security;

drop policy if exists "Anyone can insert plate alerts" on public.plate_alerts;
create policy "Anyone can insert plate alerts"
  on public.plate_alerts for insert
  with check (telegram_user_id is not null and length(plate_key) > 0);

drop policy if exists "Anyone can read plate alerts" on public.plate_alerts;
create policy "Anyone can read plate alerts"
  on public.plate_alerts for select
  using (true);

drop policy if exists "Anyone can delete plate alerts" on public.plate_alerts;
create policy "Anyone can delete plate alerts"
  on public.plate_alerts for delete
  using (true);

grant select, insert, delete on public.plate_alerts to anon, authenticated;

-- Тот же ключ, что plateKey() в src/utils/numberUtils.js: без пробелов, буквы в латинице.
create or replace function public.plate_key(raw text)
returns text
language sql
immutable
as $$
  select translate(
    lower(regexp_replace(coalesce(raw, ''), '[^0-9A-Za-zА-Яа-яЁё]', '', 'g')),
    'авекмнорстух',
    'abekmhopctyx'
  );
$$;

create or replace function public.notify_plate_alerts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  token text;
  key text;
  rec record;
  price_text text;
  msg text;
begin
  if NEW.status is distinct from 'Свободен' then
    return NEW;
  end if;

  if TG_OP = 'UPDATE'
     and OLD.status = 'Свободен'
     and public.plate_key(OLD.number) = public.plate_key(NEW.number) then
    return NEW;
  end if;

  key := public.plate_key(NEW.number);
  if key is null or key = '' then
    return NEW;
  end if;

  select decrypted_secret into token
  from vault.decrypted_secrets
  where name = 'telegram_bot_token'
  limit 1;

  if token is null or token = '' then
    return NEW;
  end if;

  if NEW.price is null or btrim(NEW.price) = '' or lower(btrim(NEW.price)) = 'договорная' then
    price_text := 'договорная';
  elsif btrim(NEW.price) ~ '^\d+$' then
    price_text := trim(reverse(regexp_replace(reverse(btrim(NEW.price)), '(\d{3})', '\1 ', 'g'))) || ' ₽';
  else
    price_text := btrim(NEW.price);
  end if;

  msg := format(
    E'Появился номер, который вы ждали.\n\n%s\n%s\n%s\n\nОткройте каталог в боте, чтобы посмотреть его.',
    NEW.number,
    NEW.city,
    price_text
  );

  for rec in
    select id, telegram_user_id
    from public.plate_alerts
    where notified_at is null
      and length(plate_key) >= 2
      and strpos(key, plate_key) > 0
  loop
    perform net.http_post(
      url := 'https://api.telegram.org/bot' || token || '/sendMessage',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'chat_id', rec.telegram_user_id,
        'text', msg
      )
    );

    update public.plate_alerts
      set notified_at = now()
      where id = rec.id;
  end loop;

  return NEW;
exception
  when others then
    return NEW;
end;
$$;

drop trigger if exists numbers_notify_plate_alerts on public.numbers;

create trigger numbers_notify_plate_alerts
  after insert or update of number, status
  on public.numbers
  for each row
  execute function public.notify_plate_alerts();

notify pgrst, 'reload schema';
