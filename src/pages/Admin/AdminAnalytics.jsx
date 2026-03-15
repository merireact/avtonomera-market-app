import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useNumbers } from '../../hooks/useNumbers';
import styles from './index.module.scss';

const PERIODS = [
  { key: 'today', label: 'Сегодня' },
  { key: '7', label: '7 дней' },
  { key: '30', label: '30 дней' },
];

function getRange(periodKey) {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  let from;
  if (periodKey === 'today') {
    from = new Date(now);
    from.setHours(0, 0, 0, 0);
  } else {
    const days = Number(periodKey) || 30;
    from = new Date(now);
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);
  }
  return { from: from.toISOString(), to: to.toISOString() };
}

export function AdminAnalytics() {
  const [period, setPeriod] = useState('7');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const { numbers } = useNumbers();

  const range = useMemo(() => getRange(period), [period]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setError('Supabase не настроен');
      return;
    }
    setLoading(true);
    setError(null);
    supabase
      .from('analytics_events')
      .select('event_type, visitor_id, telegram_user_id, telegram_username, number_id, created_at')
      .gte('created_at', range.from)
      .lte('created_at', range.to)
      .then(({ data, error: err }) => {
        setLoading(false);
        if (err) {
          setError(err.message);
          setEvents([]);
          return;
        }
        setEvents(data ?? []);
      });
  }, [range.from, range.to]);

  const stats = useMemo(() => {
    const visitEvents = events.filter((e) => e.event_type === 'app_visit');
    const uniqueVisitorIds = new Set(events.map((e) => e.visitor_id));
    const numberViewCounts = {};
    events.filter((e) => e.event_type === 'number_view' && e.number_id != null).forEach((e) => {
      numberViewCounts[e.number_id] = (numberViewCounts[e.number_id] || 0) + 1;
    });
    const topNumbers = Object.entries(numberViewCounts)
      .map(([numberId, views]) => ({ numberId: Number(numberId), views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 20);
    const telegramVisitors = [];
    const seen = new Set();
    events.forEach((e) => {
      if (e.telegram_user_id != null && !seen.has(e.telegram_user_id)) {
        seen.add(e.telegram_user_id);
        telegramVisitors.push({
          telegram_user_id: e.telegram_user_id,
          telegram_username: e.telegram_username || null,
        });
      }
    });
    return {
      uniqueVisitors: uniqueVisitorIds.size,
      visitCount: visitEvents.length,
      topNumbers,
      telegramVisitors,
    };
  }, [events]);

  const numbersMap = useMemo(() => {
    const m = {};
    (numbers || []).forEach((n) => { m[n.id] = n; });
    return m;
  }, [numbers]);

  if (!supabase) {
    return (
      <div className={styles.analytics}>
        <p className={styles.error}>Supabase не настроен.</p>
      </div>
    );
  }

  return (
    <div className={styles.analytics}>
      <div className={styles.periodRow}>
        <span className={styles.periodLabel}>Период:</span>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className={styles.periodSelect}
        >
          {PERIODS.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      {loading && <p className={styles.loading}>Загрузка...</p>}
      {error && <p className={styles.formError}>{error}</p>}

      {!loading && !error && (
        <>
          <div className={styles.cards}>
            <div className={styles.card}>
              <div className={styles.cardValue}>{stats.uniqueVisitors}</div>
              <div className={styles.cardLabel}>Уникальных посетителей</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardValue}>{stats.visitCount}</div>
              <div className={styles.cardLabel}>Визитов в приложение</div>
            </div>
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Кто заходил (Telegram)</h2>
            {stats.telegramVisitors.length === 0 ? (
              <p className={styles.empty}>Нет данных за период</p>
            ) : (
              <ul className={styles.visitorList}>
                {stats.telegramVisitors.map((v) => (
                  <li key={v.telegram_user_id} className={styles.visitorItem}>
                    {v.telegram_username || `ID: ${v.telegram_user_id}`}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Чаще всего просматривают</h2>
            {stats.topNumbers.length === 0 ? (
              <p className={styles.empty}>Нет данных за период</p>
            ) : (
              <ul className={styles.topList}>
                {stats.topNumbers.map(({ numberId, views }) => {
                  const num = numbersMap[numberId];
                  return (
                    <li key={numberId} className={styles.topItem}>
                      <span className={styles.topNumber}>
                        {num ? num.number : `№${numberId}`}
                        {num && num.city ? ` · ${num.city}` : ''}
                      </span>
                      <span className={styles.topViews}>{views} просмотров</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
