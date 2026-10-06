import { supabase } from '../lib/supabase';
import { isPlateRequest, plateKey } from '../utils/numberUtils';

function rowToAlert(row) {
  return {
    id: row.id,
    plate: row.plate,
    plateKey: row.plate_key,
    telegramUserId: row.telegram_user_id ?? null,
    telegramUsername: row.telegram_username ?? null,
    createdAt: row.created_at,
    notifiedAt: row.notified_at ?? null,
  };
}

export async function fetchPlateAlerts(telegramUserId) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const { data, error } = await supabase
    .from('plate_alerts')
    .select('id, plate, plate_key, created_at')
    .eq('telegram_user_id', telegramUserId)
    .is('notified_at', null)
    .order('created_at', { ascending: false });
  if (error) return { data: null, error };
  return { data: (data || []).map(rowToAlert), error: null };
}

export async function createPlateAlert({ telegramUserId, telegramUsername, plate }) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const trimmed = String(plate || '').trim();
  if (!isPlateRequest(trimmed)) {
    return { data: null, error: new Error('Укажите номер или его часть.') };
  }
  const { data, error } = await supabase
    .from('plate_alerts')
    .insert({
      telegram_user_id: telegramUserId,
      telegram_username: telegramUsername || null,
      plate: trimmed,
      plate_key: plateKey(trimmed),
    })
    .select('id, plate, plate_key, created_at')
    .single();
  if (error) return { data: null, error };
  return { data: rowToAlert(data), error: null };
}

export async function deletePlateAlert(id, telegramUserId) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  const { error } = await supabase
    .from('plate_alerts')
    .delete()
    .eq('id', id)
    .eq('telegram_user_id', telegramUserId);
  return { error };
}

export async function fetchAllPlateAlerts() {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const { data, error } = await supabase
    .from('plate_alerts')
    .select('id, plate, plate_key, telegram_user_id, telegram_username, created_at, notified_at')
    .is('notified_at', null)
    .order('created_at', { ascending: false });
  if (error) return { data: null, error };
  return { data: (data || []).map(rowToAlert), error: null };
}

export async function deletePlateAlertById(id) {
  if (!supabase) return { error: new Error('Supabase not configured') };
  const { error } = await supabase.from('plate_alerts').delete().eq('id', id);
  return { error };
}
