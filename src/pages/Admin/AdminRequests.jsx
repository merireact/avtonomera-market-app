import { useCallback, useEffect, useMemo, useState } from 'react';
import { deletePlateAlertById, fetchAllPlateAlerts } from '../../api/alerts';
import { Input } from '../../components/Input';
import styles from './index.module.scss';

function formatWhen(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function contactName(item) {
  const name = item.telegramUsername?.trim();
  if (name && !/\s/.test(name)) return `@${name.replace(/^@/, '')}`;
  if (name) return name;
  if (item.telegramUserId) return `id ${item.telegramUserId}`;
  return 'Без имени';
}

function contactHref(item) {
  const name = item.telegramUsername?.trim().replace(/^@/, '');
  if (name && /^[a-zA-Z0-9_]{4,}$/.test(name)) return `https://t.me/${name}`;
  return null;
}

export function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await fetchAllPlateAlerts();
    if (err) {
      setError(err.message || 'Не удалось загрузить запросы');
      setRequests([]);
    } else {
      setError(null);
      setRequests(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase().replace(/\s/g, '');
    if (!query) return requests;
    return requests.filter((item) => {
      const plate = (item.plate || '').toLowerCase().replace(/\s/g, '');
      const name = (item.telegramUsername || '').toLowerCase().replace(/\s/g, '');
      const id = String(item.telegramUserId || '');
      return plate.includes(query) || name.includes(query) || id.includes(query);
    });
  }, [requests, search]);

  const handleRemove = async (item) => {
    const confirmed = window.confirm(`Снять запрос на ${item.plate}?`);
    if (!confirmed) return;
    setRemovingId(item.id);
    setError(null);
    const { error: err } = await deletePlateAlertById(item.id);
    setRemovingId(null);
    if (err) {
      setError('Не удалось снять запрос');
      return;
    }
    setRequests((prev) => prev.filter((row) => row.id !== item.id));
  };

  if (loading) {
    return <p className={styles.loading}>Загрузка запросов...</p>;
  }

  return (
    <div className={styles.requestsPanel}>
      <p className={styles.syncText}>Номера, которые попросили найти.</p>
      {error && <p className={styles.formError}>{error}</p>}
      <Input placeholder="Поиск по номеру или имени..." value={search} onChange={setSearch} />
      {filtered.length === 0 ? (
        <p className={styles.empty}>{requests.length === 0 ? 'Запросов пока нет' : 'Ничего не найдено'}</p>
      ) : (
        <ul className={styles.requestList}>
          {filtered.map((item) => {
            const href = contactHref(item);
            const name = contactName(item);
            return (
              <li key={item.id} className={styles.requestItem}>
                <div className={styles.requestInfo}>
                  <p className={styles.requestPlate}>{item.plate}</p>
                  <p className={styles.requestMeta}>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {name}
                      </a>
                    ) : (
                      name
                    )}
                    {item.createdAt ? ` · ${formatWhen(item.createdAt)}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.requestRemove}
                  onClick={() => handleRemove(item)}
                  disabled={removingId === item.id}
                >
                  {removingId === item.id ? 'Снимаем...' : 'Снять'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
