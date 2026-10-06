import { supabase } from '../lib/supabase';

function parsePrice(value) {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (s.toLowerCase() === 'договорная') return 'договорная';
  const compact = s.replace(/\s/g, '').replace(/₽/g, '');
  const thousands = compact.match(/^(\d{1,3}(?:\.\d{3})+)$/);
  const n = thousands ? Number(thousands[1].replace(/\./g, '')) : Number(compact.replace(',', '.'));
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
    isAuto: Boolean(row.is_auto),
    isOther: Boolean(row.is_other),
  };
}

const NUMBER_COLUMNS = 'id, number, city, price, status, vip, same_digits, same_letters, beautiful, is_auto, is_other';
const NUMBER_COLUMNS_WITHOUT_TYPE = 'id, number, city, price, status, vip, same_digits, same_letters, beautiful';

function missingPlateTypeColumns(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`;
  return /is_auto|is_other/.test(message);
}

export async function fetchNumbers() {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const first = await supabase
    .from('numbers')
    .select(NUMBER_COLUMNS)
    .order('created_at', { ascending: false });
  if (first.error && missingPlateTypeColumns(first.error)) {
    const fallback = await supabase
      .from('numbers')
      .select(NUMBER_COLUMNS_WITHOUT_TYPE)
      .order('created_at', { ascending: false });
    if (fallback.error) return { data: null, error: fallback.error };
    return { data: (fallback.data || []).map(rowToNumber), error: null };
  }
  if (first.error) return { data: null, error: first.error };
  return { data: (first.data || []).map(rowToNumber), error: null };
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
      is_auto: Boolean(payload.isAuto),
      is_other: Boolean(payload.isOther),
    })
    .select(NUMBER_COLUMNS)
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
  if (payload.vip !== undefined) updates.vip = Boolean(payload.vip);
  if (payload.sameDigits !== undefined) updates.same_digits = Boolean(payload.sameDigits);
  if (payload.sameLetters !== undefined) updates.same_letters = Boolean(payload.sameLetters);
  if (payload.isAuto !== undefined) updates.is_auto = Boolean(payload.isAuto);
  if (payload.isOther !== undefined) updates.is_other = Boolean(payload.isOther);
  if (Object.keys(updates).length === 0) return { data: null, error: null };
  const { data, error } = await supabase
    .from('numbers')
    .update(updates)
    .eq('id', Number(id))
    .select(NUMBER_COLUMNS)
    .single();
  if (error) return { data: null, error };
  return { data: rowToNumber(data), error: null };
}

export async function deleteNumber(id) {
  return deleteNumbers([id]);
}

export async function deleteNumbers(ids) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const unique = [...new Set(ids.map((id) => Number(id)).filter((id) => Number.isFinite(id)))];
  if (unique.length === 0) return { data: true, error: null };

  const chunkSize = 100;
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('numbers')
      .delete()
      .in('id', chunk);
    if (error) return { data: null, error };
  }
  return { data: true, error: null };
}
