import { supabase } from '../lib/supabase';

function parsePrice(value) {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (s.toLowerCase() === 'договорная') return 'договорная';
  const n = Number(s.replace(/\s/g, ''));
  return Number.isFinite(n) ? n : s;
}

function rowToNumber(row) {
  return {
    id: row.id,
    number: row.number,
    city: row.city,
    price: parsePrice(row.price),
    status: row.status,
    vip: Boolean(row.vip),
    sameDigits: Boolean(row.same_digits),
    sameLetters: Boolean(row.same_letters),
    beautiful: Boolean(row.beautiful),
  };
}

export async function fetchNumbers() {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const { data, error } = await supabase
    .from('numbers')
    .select('id, number, city, price, status, vip, same_digits, same_letters, beautiful')
    .order('id', { ascending: true });
  if (error) return { data: null, error };
  return { data: (data || []).map(rowToNumber), error: null };
}

export async function addNumber(payload) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const price = payload.price != null && payload.price !== ''
    ? (typeof payload.price === 'number' ? String(payload.price) : String(payload.price).trim())
    : '';
  const { data, error } = await supabase
    .from('numbers')
    .insert({
      number: (payload.number || '').trim(),
      city: (payload.city || '').trim(),
      price: price || '0',
      status: (payload.status || 'Свободен').trim(),
      vip: Boolean(payload.vip),
      same_digits: Boolean(payload.sameDigits),
      same_letters: Boolean(payload.sameLetters),
      beautiful: Boolean(payload.beautiful),
    })
    .select('id, number, city, price, status, vip, same_digits, same_letters, beautiful')
    .single();
  if (error) return { data: null, error };
  return { data: rowToNumber(data), error: null };
}

export async function updateNumber(id, payload) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const updates = {};
  if (payload.status !== undefined) updates.status = String(payload.status).trim();
  if (payload.price !== undefined) {
    updates.price = payload.price === '' || String(payload.price).toLowerCase().trim() === 'договорная'
      ? 'договорная'
      : (typeof payload.price === 'number' ? String(payload.price) : String(payload.price).trim());
  }
  if (Object.keys(updates).length === 0) return { data: null, error: null };
  const { data, error } = await supabase
    .from('numbers')
    .update(updates)
    .eq('id', Number(id))
    .select('id, number, city, price, status, vip, same_digits, same_letters, beautiful')
    .single();
  if (error) return { data: null, error };
  return { data: rowToNumber(data), error: null };
}

export async function deleteNumber(id) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const { error } = await supabase
    .from('numbers')
    .delete()
    .eq('id', Number(id));
  if (error) return { data: null, error };
  return { data: true, error: null };
}
