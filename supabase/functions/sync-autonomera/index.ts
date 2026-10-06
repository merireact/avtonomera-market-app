import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { fetchSellerListings, plateKey } from './listings.mjs';

const COOLDOWN_MS = 60 * 60 * 1000;
const RUNNING_LOCK_MS = 15 * 60 * 1000;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function pricesEqual(left, right) {
  const a = String(left ?? '').replace(/\s/g, '').toLowerCase();
  const b = String(right ?? '').replace(/\s/g, '').toLowerCase();
  return a === b;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const cronSecret = Deno.env.get('SYNC_CRON_SECRET') ?? '';
  if (!supabaseUrl || !serviceKey) return json({ error: 'Supabase не настроен' }, 500);

  let force = false;
  try {
    const body = await req.json();
    force = Boolean(body?.force);
  } catch {
    force = false;
  }

  const auth = req.headers.get('Authorization') ?? '';
  const headerSecret = req.headers.get('x-sync-secret') ?? '';
  const isCron = Boolean(
    (cronSecret && headerSecret === cronSecret)
    || (serviceKey && auth === `Bearer ${serviceKey}`),
  );

  if (force && !isCron) {
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) return json({ error: 'Нужен вход в админку' }, 401);
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: state, error: stateError } = await admin
    .from('catalog_sync')
    .select('status, started_at, finished_at')
    .eq('id', 1)
    .maybeSingle();
  if (stateError) {
    return json({ error: 'Сначала выполните миграцию каталога в Supabase' }, 500);
  }

  const now = Date.now();
  const startedAt = state?.started_at ? new Date(state.started_at).getTime() : 0;
  const finishedAt = state?.finished_at ? new Date(state.finished_at).getTime() : 0;
  if (!force && !isCron && state?.status === 'running' && now - startedAt < RUNNING_LOCK_MS) {
    return json({ ran: false, reason: 'running' });
  }
  if (!force && !isCron && state?.status === 'ok' && finishedAt && now - finishedAt < COOLDOWN_MS) {
    return json({ ran: false, reason: 'fresh', finished_at: state.finished_at });
  }

  await admin.from('catalog_sync').upsert({
    id: 1,
    status: 'running',
    started_at: new Date().toISOString(),
    error: null,
  });

  try {
    const listings = await fetchSellerListings();
    const { data: existing, error: existingError } = await admin
      .from('numbers')
      .select('id, number, city, status, external_id, source, vip, price');
    if (existingError) throw existingError;

    const rows = existing || [];
    const byExternal = new Map();
    const byPlate = new Map();
    for (const row of rows) {
      if (row.external_id) byExternal.set(String(row.external_id), row);
      const key = plateKey(row.number);
      if (key && !byPlate.has(key)) byPlate.set(key, row);
    }

    const seenExternal = new Set(listings.map((item) => item.externalId));
    const usedIds = new Set();
    const toInsert = [];
    const toUpdate = [];

    for (const item of listings) {
      const row = byExternal.get(item.externalId) || byPlate.get(plateKey(item.number));
      if (row && !usedIds.has(row.id)) {
        usedIds.add(row.id);
        const next = {
          number: item.number,
          city: item.city,
          status: 'Свободен',
          external_id: item.externalId,
          source: 'autonomera',
          same_digits: item.sameDigits,
          same_letters: item.sameLetters,
          created_at: item.createdAt,
        };
        if (!pricesEqual(row.price, item.price)) next.price = item.price;
        const changed = next.price !== undefined
          || row.number !== item.number
          || row.city !== item.city
          || row.status !== 'Свободен'
          || String(row.external_id || '') !== item.externalId
          || row.source !== 'autonomera';
        if (changed) toUpdate.push({ id: row.id, ...next });
        continue;
      }
      if (!row) {
        toInsert.push({
          number: item.number,
          city: item.city,
          price: item.price,
          status: 'Свободен',
          vip: false,
          same_digits: item.sameDigits,
          same_letters: item.sameLetters,
          beautiful: false,
          external_id: item.externalId,
          source: 'autonomera',
          created_at: item.createdAt,
        });
      }
    }

    const staleIds = rows
      .filter((row) => row.source === 'autonomera'
        && row.external_id
        && !seenExternal.has(String(row.external_id))
        && !usedIds.has(row.id))
      .map((row) => row.id);

    for (let i = 0; i < toUpdate.length; i += 15) {
      const chunk = toUpdate.slice(i, i + 15);
      const results = await Promise.all(chunk.map(async (row) => {
        const { id, ...fields } = row;
        const { error } = await admin.from('numbers').update(fields).eq('id', id);
        return error;
      }));
      const failed = results.find(Boolean);
      if (failed) throw failed;
    }

    for (let i = 0; i < toInsert.length; i += 50) {
      const { error } = await admin.from('numbers').insert(toInsert.slice(i, i + 50));
      if (error) throw error;
    }

    for (let i = 0; i < staleIds.length; i += 100) {
      const { error } = await admin.from('numbers').delete().in('id', staleIds.slice(i, i + 100));
      if (error) throw error;
    }

    const summary = {
      ran: true,
      added: toInsert.length,
      updated: toUpdate.length,
      removed: staleIds.length,
      total: listings.length,
    };
    await admin.from('catalog_sync').upsert({
      id: 1,
      status: 'ok',
      finished_at: new Date().toISOString(),
      added: summary.added,
      updated: summary.updated,
      removed: summary.removed,
      error: null,
    });
    return json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось синхронизировать каталог';
    await admin.from('catalog_sync').upsert({
      id: 1,
      status: 'error',
      finished_at: new Date().toISOString(),
      error: message,
    });
    return json({ error: message }, 500);
  }
});
