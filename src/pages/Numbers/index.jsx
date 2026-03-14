import { useState, useMemo, useCallback, useEffect } from 'react';
import { NumberCard } from '../../components/NumberCard';
import { Input } from '../../components/Input';
import { Filters } from '../../components/Filters';
import numbersData from '../../data/numbers.json';
import styles from './index.module.scss';

const PAGE_SIZE = 20;

export function Numbers() {
  const [favorites, setFavorites] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    vip: false,
    beautiful: false,
    free: false,
    sameDigits: false,
    sameLetters: false,
  });

  const filtered = useMemo(() => {
    return numbersData.filter((item) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!item.number.toLowerCase().includes(q) && !item.city.toLowerCase().includes(q)) return false;
      }
      if (filters.vip && !item.vip) return false;
      if (filters.beautiful && !item.beautiful) return false;
      if (filters.free && item.status !== 'Свободен') return false;
      if (filters.sameDigits && !item.sameDigits) return false;
      if (filters.sameLetters && !item.sameLetters) return false;
      return true;
    });
  }, [search, filters]);

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

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Все номера</h1>
        <div className={styles.search}>
          <Input placeholder="Поиск номера..." value={search} onChange={setSearch} />
        </div>
        <div className={styles.filtersSection}>
          <Filters selected={filters} onChange={setFilters} />
        </div>
      </header>
      <main className={styles.main}>
        <ul className={styles.list}>
          {visible.map((item) => (
            <li key={item.id}>
              <NumberCard
                item={item}
                isFavorite={favorites.has(item.id)}
                onToggleFavorite={toggleFavorite}
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
      </main>
    </div>
  );
}
