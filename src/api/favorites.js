import { supabase } from '../lib/supabase';
import { numericPrice } from '../utils/priceUtils';

export async function fetchFavoriteIds(telegramUserId) {
  if (!supabase || telegramUserId == null) return null;
  const { data, error } = await supabase
    .from('favorite_watches')
    .select('number_id')
    .eq('telegram_user_id', telegramUserId);
  if (error) return null;
  return (data || []).map((row) => Number(row.number_id)).filter((id) => Number.isFinite(id));
}

export async function syncFavorite({ telegramUserId, numberId, price, active }) {
  if (!supabase || telegramUserId == null) return { error: null };
  const id = Number(numberId);
  if (!Number.isFinite(id)) return { error: new Error('Invalid number id') };

  if (active) {
    const { error } = await supabase.from('favorite_watches').upsert(
      {
        telegram_user_id: telegramUserId,
        number_id: id,
        watched_price: numericPrice(price),
      },
      { onConflict: 'telegram_user_id,number_id' },
    );
    return { error: error ?? null };
  }

  const { error } = await supabase
    .from('favorite_watches')
    .delete()
    .eq('telegram_user_id', telegramUserId)
    .eq('number_id', id);
  return { error: error ?? null };
}
