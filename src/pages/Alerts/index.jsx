import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { useNumbers } from '../../hooks/useNumbers';
import { createPlateAlert, deletePlateAlert, fetchPlateAlerts } from '../../api/alerts';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { isFullPlate, isPlateRequest, plateKey } from '../../utils/numberUtils';
import styles from './index.module.scss';

function formatPlateInput(value) {
  return value.replace(/\s+/g, ' ').trim();
}

export function Alerts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useTelegram();
  const { numbers } = useNumbers();
  const [plate, setPlate] = useState(() => searchParams.get('plate') || '');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setAlerts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await fetchPlateAlerts(user.id);
    if (err) setError(err.message);
    else {
      setError(null);
      setAlerts(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const existingFree = useMemo(() => {
    const key = plateKey(plate);
    if (!isFullPlate(plate)) return null;
    return numbers.find((item) => plateKey(item.number) === key && item.status === 'Свободен') || null;
  }, [numbers, plate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const value = formatPlateInput(plate);
    if (!isPlateRequest(value)) {
      setFormError('Укажите номер или его часть, например 777 или А777АА.');
      return;
    }
    if (!user?.id) {
      setFormError('Откройте из Telegram.');
      return;
    }
    if (existingFree) {
      setFormError('Этот номер уже есть в каталоге.');
      return;
    }
    setSaving(true);
    const { data, error: err } = await createPlateAlert({
      telegramUserId: user.id,
      telegramUsername: user.username || user.first_name || null,
      plate: value,
    });
    setSaving(false);
    if (err) {
      const duplicate = err.code === '23505' || /duplicate|unique/i.test(err.message || '');
      setFormError(duplicate ? 'Запрос уже отправлен.' : 'Не удалось отправить. Попробуйте ещё раз.');
      return;
    }
    setPlate('');
    setAlerts((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
  };

  const handleDelete = async (id) => {
    if (!user?.id) return;
    const previous = alerts;
    setAlerts((prev) => prev.filter((item) => item.id !== id));
    const { error: err } = await deletePlateAlert(id, user.id);
    if (err) {
      setAlerts(previous);
      setError('Не удалось убрать запрос.');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button type="button" className={styles.back} onClick={() => navigate(-1)} aria-label="Назад">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={styles.title}>Запрос номера</h1>
      </header>

      <p className={styles.lead}>
        Введите номер или его часть. Запрос увидят администраторы.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>
          Номер
          <Input
            value={plate}
            onChange={setPlate}
            placeholder="777 или А777АА"
          />
        </label>
        {existingFree && (
          <p className={styles.hint}>
            Уже в каталоге.{' '}
            <Link to={`/numbers/${existingFree.id}`}>Открыть</Link>
          </p>
        )}
        {formError && <p className={styles.formError}>{formError}</p>}
        <Button type="submit" disabled={saving || Boolean(existingFree)}>
          {saving ? 'Отправляем...' : 'Отправить'}
        </Button>
      </form>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Мои запросы</h2>
        {loading ? (
          <p className={styles.meta}>Загрузка...</p>
        ) : error ? (
          <p className={styles.formError}>{error}</p>
        ) : alerts.length === 0 ? (
          <p className={styles.meta}>Пока пусто.</p>
        ) : (
          <ul className={styles.list}>
            {alerts.map((item) => (
              <li key={item.id} className={styles.item}>
                <div>
                  <p className={styles.plate}>{item.plate}</p>
                  <p className={styles.itemMeta}>Запрос отправлен</p>
                </div>
                <button type="button" className={styles.remove} onClick={() => handleDelete(item.id)}>
                  Убрать
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
