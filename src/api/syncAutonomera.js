import { supabase } from '../lib/supabase';

export async function requestCatalogSync({ force = false } = {}) {
  if (!supabase) return { data: null, error: new Error('Supabase не настроен') };
  const { data, error } = await supabase.functions.invoke('sync-autonomera', {
    body: { force },
  });
  if (error) return { data: null, error };
  if (data?.error) return { data: null, error: new Error(data.error) };
  return { data, error: null };
}
