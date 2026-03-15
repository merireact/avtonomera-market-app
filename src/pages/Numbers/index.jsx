import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NumberCard } from '../../components/NumberCard';
import { Input } from '../../components/Input';
import { Tabs } from '../../components/Tabs';
import { Filters } from '../../components/Filters';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { useNumbers } from '../../hooks/useNumbers';
import { useAuth } from '../../context/AuthContext';
import { updateNumber, deleteNumber } from '../../api/numbers';
import { getRegionByNumber } from '../../utils/regions';
import { hasSameMiddleDigits, hasSameLetters } from '../../utils/numberUtils';
import styles from './index.module.scss';

const PAGE_SIZE = 20;

const REGION_TABS = [
  { value: 'all', label: 'Все' },
  { value: 'moscow', label: 'Москва' },
  { value: 'region', label: 'Московская область' },
];

export function Numbers() {
  const location = useLocation();
  const { numbers: numbersData, loading: numbersLoading, refetch: refetchNumbers } = useNumbers();
  const { isAdmin } = useAuth();
  const [editItem, setEditItem] = useState(null);
  const [editStatus, setEditStatus] = useState('Свободен');
  const [editPrice, setEditPrice] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editDeleting, setEditDeleting] = useState(false);
  const [editError, setEditError] = useState(null);
  const stateFilters = location.state?.filters;
  const stateSearch = location.state?.search ?? '';
  const [region, setRegion] = useState(location.state?.region ?? 'all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState(typeof stateSearch === 'string' ? stateSearch : '');
  const [filters, setFilters] = useState({
    vip: stateFilters?.exclusive ?? false,
    free: stateFilters?.free ?? false,
    sameDigits: stateFilters?.sameDigits ?? false,
    sameLetters: stateFilters?.sameLetters ?? false,
  });

  useEffect(() => {
    const fromState = location.state;
    if (fromState?.region === 'moscow' || fromState?.region === 'region') setRegion(fromState.region);
    if (typeof fromState?.search === 'string') setSearch(fromState.search);
    if (fromState?.filters) {
      setFilters({
        vip: fromState.filters.exclusive ?? false,
        free: fromState.filters.free ?? false,
        sameDigits: fromState.filters.sameDigits ?? false,
        sameLetters: fromState.filters.sameLetters ?? false,
      });
    }
  }, [location.state]);

  const filtered = useMemo(() => {
    if (!numbersData.length) return [];
    return numbersData.filter((item) => {
      const numberRegion = getRegionByNumber(item.number);
      if (region === 'moscow' && numberRegion !== 'Москва') return false;
      if (region === 'region' && numberRegion !== 'Московская область') return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!item.number.toLowerCase().includes(q) && !item.city.toLowerCase().includes(q)) return false;
      }
      if (filters.vip && !item.vip) return false;
      if (filters.free && item.status !== 'Свободен') return false;
      if (filters.sameDigits && !hasSameMiddleDigits(item.number)) return false;
      if (filters.sameLetters && !hasSameLetters(item.number)) return false;
      return true;
    });
  }, [numbersData, search, filters, region]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  const loadMore = useCallback(() => {
    setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollHeight - scrollTop - clientHeight < 200 && hasMore) loadMore();
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadMore]);

  const openEdit = useCallback((item) => {
    setEditItem(item);
    setEditStatus(item.status || 'Свободен');
    setEditPrice(typeof item.price === 'string' ? item.price : (item.price != null ? String(item.price) : ''));
    setEditError(null);
  }, []);

  const closeEdit = useCallback(() => {
    setEditItem(null);
    setEditError(null);
  }, []);

  const handleEditSave = useCallback(async (e) => {
    e.preventDefault();
    if (!editItem) return;
    setEditError(null);
    setEditSaving(true);
    const priceVal = editPrice.trim() === '' || editPrice.trim().toLowerCase() === 'договорная' ? 'договорная' : editPrice.trim();
    const { error } = await updateNumber(editItem.id, { status: editStatus.trim(), price: priceVal });
    setEditSaving(false);
    if (error) {
      setEditError(error.message);
      return;
    }
    await refetchNumbers();
    closeEdit();
  }, [editItem, editStatus, editPrice, refetchNumbers, closeEdit]);

  const handleEditDelete = useCallback(async () => {
    if (!editItem) return;
    if (!window.confirm(`Удалить номер ${editItem.number.replace(/\s/g, '')}?`)) return;
    setEditError(null);
    setEditDeleting(true);
    const { error } = await deleteNumber(editItem.id);
    setEditDeleting(false);
    if (error) {
      setEditError(error.message);
      return;
    }
    await refetchNumbers();
    closeEdit();
  }, [editItem, refetchNumbers, closeEdit]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Все номера</h1>
        <div className={styles.tabsWrap}>
          <Tabs tabs={REGION_TABS} activeValue={region} onChange={setRegion} />
        </div>
        <div className={styles.search}>
          <Input placeholder="Поиск номера..." value={search} onChange={setSearch} />
        </div>
        <div className={styles.filtersSection}>
          <Filters selected={filters} onChange={setFilters} />
        </div>
      </header>
      <main className={styles.main}>
        {numbersLoading ? (
          <p className={styles.loading}>Загрузка номеров...</p>
        ) : (
          <>
            <ul className={styles.list}>
              {visible.map((item) => (
                <li key={item.id}>
                  <NumberCard
                    item={item}
                    showEditButton={isAdmin}
                    onEditClick={openEdit}
                  />
                </li>
              ))}
            </ul>
            {hasMore && (
              <div className={styles.loadMore}>
                <button type="button" className={styles.loadMoreBtn} onClick={loadMore}>
                  Загрузить ещё
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Modal open={Boolean(editItem)} onClose={closeEdit} title="Изменить номер">
        {editItem && (
          <form className={styles.editForm} onSubmit={handleEditSave}>
            <p className={styles.editNumber}>{editItem.number.replace(/\s/g, '')}</p>
            {editError && <p className={styles.editError}>{editError}</p>}
            <label className={styles.editLabel}>
              Статус
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className={styles.editSelect}>
                <option value="Свободен">Свободен</option>
                <option value="Забронирован">Забронирован</option>
              </select>
            </label>
            <label className={styles.editLabel}>
              Цена (число или «договорная»)
              <Input value={editPrice} onChange={setEditPrice} placeholder="400000 или договорная" />
            </label>
            <div className={styles.editActions}>
              <Button type="button" variant="secondary" onClick={closeEdit} disabled={editSaving || editDeleting}>Отмена</Button>
              <Button type="submit" disabled={editSaving || editDeleting}>{editSaving ? 'Сохранение...' : 'Сохранить'}</Button>
            </div>
            <div className={styles.editDeleteWrap}>
              <button
                type="button"
                className={styles.editDeleteBtn}
                onClick={handleEditDelete}
                disabled={editSaving || editDeleting}
              >
                {editDeleting ? 'Удаление...' : 'Удалить номер'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
