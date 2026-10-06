-- Запрос может быть частью номера: «777» и «А777АА» совпадают с «А777АА 77».
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
