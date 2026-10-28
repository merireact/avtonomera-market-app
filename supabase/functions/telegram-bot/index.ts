import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { catalogMessages, isNumbersCommand, isStartCommand, welcomeText } from './messages.mjs';

const APP_URL = Deno.env.get('MINI_APP_URL') ?? 'https://merireact.github.io/avtonomera-market-app';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

let commandsReady = false;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

async function botToken(admin) {
  const fromEnv = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? '';
  if (fromEnv) return fromEnv;
  const { data, error } = await admin.rpc('telegram_bot_token');
  if (error || typeof data !== 'string') return '';
  return data;
}

async function fetchCatalog(admin) {
  const pageSize = 1000;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin
      .from('numbers')
      .select('number, city, price, status')
      .order('number', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

async function telegram(token, method, body) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.description || `Telegram ${method} failed`);
  }
  return payload;
}

async function ensureCommands(token) {
  if (commandsReady) return;
  try {
    await telegram(token, 'setMyCommands', {
      commands: [{ command: 'numbers', description: 'Весь список номеров' }],
    });
    commandsReady = true;
  } catch {
    // Команда всё равно сработает, если её набрать вручную.
  }
}

async function sendWelcome(token, chatId, languageCode) {
  let description = '';
  try {
    const { result } = await telegram(token, 'getMyDescription', languageCode ? { language_code: languageCode } : {});
    description = result?.description || '';
    if (!description && languageCode) {
      description = (await telegram(token, 'getMyDescription', {})).result?.description || '';
    }
  } catch {
    description = '';
  }
  await telegram(token, 'sendMessage', {
    chat_id: chatId,
    text: welcomeText(description),
    reply_markup: {
      inline_keyboard: [[{ text: 'Открыть каталог', web_app: { url: APP_URL } }]],
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const webhookSecret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET') ?? '';
  if (webhookSecret) {
    const header = req.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? '';
    if (header !== webhookSecret) return json({ error: 'Forbidden' }, 401);
  }

  let update;
  try {
    update = await req.json();
  } catch {
    return json({ ok: true });
  }

  const message = update?.message;
  const text = message?.text;
  const chatId = message?.chat?.id;
  const isStart = isStartCommand(text);
  if (!text || chatId == null || (!isStart && !isNumbersCommand(text))) return json({ ok: true });

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceKey) return json({ error: 'Supabase не настроен' }, 500);

  const admin = createClient(supabaseUrl, serviceKey);
  try {
    const token = await botToken(admin);
    if (!token) return json({ error: 'Нет токена бота' }, 500);
    await ensureCommands(token);
    if (isStart) {
      await sendWelcome(token, chatId, message?.from?.language_code);
      return json({ ok: true });
    }
    const rows = await fetchCatalog(admin);
    for (const part of catalogMessages(rows)) {
      await telegram(token, 'sendMessage', {
        chat_id: chatId,
        text: part,
        disable_web_page_preview: true,
      });
    }
    return json({ ok: true });
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Не удалось отправить список';
    return json({ ok: false, error: description });
  }
});
