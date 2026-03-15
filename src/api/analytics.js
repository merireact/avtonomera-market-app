import { supabase } from '../lib/supabase';

const VISITOR_ID_KEY = 'avtonomera_visitor_id';
const SESSION_VISIT_KEY = 'avtonomera_session_visit';
const NUMBER_VIEW_THROTTLE_MS = 60 * 60 * 1000; // 1 hour per visitor + number_id

function getOrCreateVisitorId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

/**
 * @param {{ id: number, first_name?: string, username?: string } | null} telegramUser
 */
export function trackAppVisit(telegramUser = null) {
  if (!supabase) return;
  if (typeof window === 'undefined') return;
  if (sessionStorage.getItem(SESSION_VISIT_KEY)) return;
  sessionStorage.setItem(SESSION_VISIT_KEY, '1');

  const visitorId = getOrCreateVisitorId();
  if (!visitorId) return;

  const payload = {
    event_type: 'app_visit',
    visitor_id: visitorId,
    telegram_user_id: telegramUser?.id ?? null,
    telegram_username: telegramUser?.username ?? telegramUser?.first_name ?? null,
    number_id: null,
  };

  supabase.from('analytics_events').insert(payload).then(() => {});
}

/**
 * @param {number} numberId
 * @param {{ id: number, first_name?: string, username?: string } | null} telegramUser
 */
export function trackNumberView(numberId, telegramUser = null) {
  if (!supabase) return;
  if (typeof window === 'undefined') return;

  const visitorId = getOrCreateVisitorId();
  if (!visitorId) return;

  const throttleKey = `avtonomera_nv_${visitorId}_${numberId}`;
  const last = localStorage.getItem(throttleKey);
  const now = Date.now();
  if (last && now - Number(last) < NUMBER_VIEW_THROTTLE_MS) return;
  localStorage.setItem(throttleKey, String(now));

  const payload = {
    event_type: 'number_view',
    visitor_id: visitorId,
    telegram_user_id: telegramUser?.id ?? null,
    telegram_username: telegramUser?.username ?? telegramUser?.first_name ?? null,
    number_id: numberId,
  };

  supabase.from('analytics_events').insert(payload).then(() => {});
}
