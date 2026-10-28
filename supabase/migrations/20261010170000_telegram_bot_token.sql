-- Токен бота уже лежит в Vault. Функция отдаёт его только service_role,
-- чтобы команда /numbers могла писать в Telegram.
create or replace function public.telegram_bot_token()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select decrypted_secret
  from vault.decrypted_secrets
  where name = 'telegram_bot_token'
  limit 1;
$$;

revoke all on function public.telegram_bot_token() from public;
revoke all on function public.telegram_bot_token() from anon, authenticated;
grant execute on function public.telegram_bot_token() to service_role;
