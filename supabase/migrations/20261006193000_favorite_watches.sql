-- Избранное пользователя Telegram и сообщение бота, когда цена номера снижается.
create extension if not exists pg_net;

create table if not exists public.favorite_watches (
  telegram_user_id bigint not null,
  number_id int not null references public.numbers(id) on delete cascade,
  watched_price numeric,
  created_at timestamptz default now(),
  primary key (telegram_user_id, number_id)
);

create index if not exists favorite_watches_number_id_idx
  on public.favorite_watches (number_id);

alter table public.favorite_watches enable row level security;

drop policy if exists "Anyone can insert favorite watches" on public.favorite_watches;
create policy "Anyone can insert favorite watches"
  on public.favorite_watches for insert
  with check (telegram_user_id is not null);

drop policy if exists "Anyone can read favorite watches" on public.favorite_watches;
create policy "Anyone can read favorite watches"
  on public.favorite_watches for select
  using (true);

drop policy if exists "Anyone can update favorite watches" on public.favorite_watches;
create policy "Anyone can update favorite watches"
  on public.favorite_watches for update
  using (true);

drop policy if exists "Anyone can delete favorite watches" on public.favorite_watches;
create policy "Anyone can delete favorite watches"
  on public.favorite_watches for delete
  using (true);

create or replace function public.notify_favorite_price_drop()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  token text;
  old_raw text;
  new_raw text;
  old_num numeric;
  new_num numeric;
  old_text text;
  new_text text;
  msg text;
  rec record;
begin
  old_raw := regexp_replace(btrim(coalesce(OLD.price, '')), '\s', '', 'g');
  new_raw := regexp_replace(btrim(coalesce(NEW.price, '')), '\s', '', 'g');

  if old_raw !~ '^\d+(\.\d+)?$' or new_raw !~ '^\d+(\.\d+)?$' then
    return NEW;
  end if;

  old_num := old_raw::numeric;
  new_num := new_raw::numeric;
  if new_num >= old_num then
    return NEW;
  end if;

  select decrypted_secret into token
  from vault.decrypted_secrets
  where name = 'telegram_bot_token'
  limit 1;

  if token is null or token = '' then
    return NEW;
  end if;

  old_text := trim(reverse(regexp_replace(reverse(split_part(old_raw, '.', 1)), '(\d{3})', '\1 ', 'g'))) || ' ₽';
  new_text := trim(reverse(regexp_replace(reverse(split_part(new_raw, '.', 1)), '(\d{3})', '\1 ', 'g'))) || ' ₽';

  msg := format(
    E'Цена на номер из избранного снизилась.\n\n%s\n%s\nБыло: %s\nСтало: %s\n\nОткройте каталог в боте, чтобы посмотреть его.',
    NEW.number,
    NEW.city,
    old_text,
    new_text
  );

  for rec in
    select telegram_user_id
    from public.favorite_watches
    where number_id = NEW.id
  loop
    perform net.http_post(
      url := 'https://api.telegram.org/bot' || token || '/sendMessage',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'chat_id', rec.telegram_user_id,
        'text', msg
      )
    );
  end loop;

  update public.favorite_watches
    set watched_price = new_num
    where number_id = NEW.id;

  return NEW;
exception
  when others then
    return NEW;
end;
$$;

drop trigger if exists numbers_notify_favorite_price_drop on public.numbers;

create trigger numbers_notify_favorite_price_drop
  after update of price
  on public.numbers
  for each row
  execute function public.notify_favorite_price_drop();
