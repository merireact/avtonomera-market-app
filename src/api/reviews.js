import { supabase } from '../lib/supabase';

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

function rowToReview(row) {
  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    text: row.text,
    date: formatDate(row.created_at),
  };
}

export async function fetchReviews() {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const { data, error } = await supabase
    .from('reviews')
    .select('id, name, rating, text, created_at')
    .order('created_at', { ascending: false });
  if (error) return { data: null, error };
  return { data: (data || []).map(rowToReview), error: null };
}

export async function addReview({ name, rating, text }) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const { data, error } = await supabase
    .from('reviews')
    .insert({ name: name.trim(), rating: Number(rating), text: text.trim() })
    .select('id, name, rating, text, created_at')
    .single();
  if (error) return { data: null, error };
  return { data: rowToReview(data), error: null };
}

export async function deleteReview(id) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);
  if (error) return { data: null, error };
  return { data: true, error: null };
}
