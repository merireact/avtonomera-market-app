import { useEffect, useMemo, useRef, useState } from 'react';
import { deleteNumbers } from '../../api/numbers';
import { Input } from '../../components/Input';
import { useNumbers } from '../../hooks/useNumbers';
import styles from './index.module.scss';

function formatPrice(item) {
  return typeof item.price === 'string'
    ? item.price
    : new Intl.NumberFormat('ru-RU').format(item.price) + ' ₽';
}

function numbersWord(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'номер';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'номера';
  return 'номеров';
}

export function AdminDelete() {
  const { numbers, loading, error: loadError, refetch } = useNumbers();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [success, setSuccess] = useState(null);
  const selectAllRef = useRef(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return numbers;
    const compactQuery = query.replace(/\s/g, '');
    return numbers.filter((item) => {
      const number = item.number.toLowerCase().replace(/\s/g, '');
      const city = (item.city || '').toLowerCase();
      return number.includes(compactQuery) || city.includes(query);
    });
  }, [numbers, search]);

  const selectedCount = selected.size;
  const allFilteredSelected = filtered.length > 0 && filtered.every((item) => selected.has(item.id));
  const someFilteredSelected = filtered.some((item) => selected.has(item.id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someFilteredSelected && !allFilteredSelected;
    }
  }, [someFilteredSelected, allFilteredSelected]);

  const toggleOne = (id) => {
    setSuccess(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllFiltered = () => {
    setSuccess(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((item) => next.delete(item.id));
      } else {
        filtered.forEach((item) => next.add(item.id));
      }
      return next;
    });
  };

  const handleDelete = async () => {
    if (selectedCount === 0 || deleting) return;
    const confirmed = window.confirm(`Удалить ${selectedCount} ${numbersWord(selectedCount)}? Это действие нельзя отменить.`);
    if (!confirmed) return;

    setActionError(null);
    setSuccess(null);
    setDeleting(true);
    const ids = [...selected];
    const { error } = await deleteNumbers(ids);
    setDeleting(false);
    if (error) {
      setActionError(error.message || 'Не удалось удалить номера');
      return;
    }
    setSelected(new Set());
    setSuccess(`Удалено: ${ids.length} ${numbersWord(ids.length)}.`);
    await refetch();
  };

  if (loading) {
    return <p className={styles.loading}>Загрузка номеров...</p>;
  }

  return (
    <div className={styles.deletePanel}>
      {loadError && (
        <p className={styles.formError}>Не удалось загрузить каталог из базы. Показаны сохранённые данные, удаление может не сработать.</p>
      )}
      {actionError && <p className={styles.formError}>{actionError}</p>}
      {success && <p className={styles.formSuccess}>{success}</p>}

      <Input placeholder="Поиск номера или региона..." value={search} onChange={setSearch} />

      <div className={styles.deleteToolbar}>
        <label className={styles.checkbox}>
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allFilteredSelected}
            onChange={toggleAllFiltered}
            disabled={filtered.length === 0 || deleting}
          />
          <span>Выделить все</span>
        </label>
        <span className={styles.deleteCount}>
          Показано {filtered.length} · выбрано {selectedCount}
        </span>
      </div>

      <button
        type="button"
        className={styles.deleteBtn}
        onClick={handleDelete}
        disabled={selectedCount === 0 || deleting}
      >
        {deleting ? 'Удаление...' : `Удалить выбранные${selectedCount ? ` (${selectedCount})` : ''}`}
      </button>

      {filtered.length === 0 ? (
        <p className={styles.empty}>Номера не найдены</p>
      ) : (
        <ul className={styles.deleteList}>
          {filtered.map((item) => (
            <li key={item.id}>
              <label className={styles.deleteRow}>
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleOne(item.id)}
                  disabled={deleting}
                />
                <span className={styles.deleteInfo}>
                  <span className={styles.deleteNumber}>{item.number.replace(/\s/g, '')}</span>
                  <span className={styles.deleteMeta}>
                    {item.city}
                    {item.status === 'Забронирован' ? ' · Забронирован' : ''}
                  </span>
                </span>
                <span className={styles.deletePrice}>{formatPrice(item)}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
