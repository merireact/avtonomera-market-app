import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NumberCard } from '../../components/NumberCard';
import { Input } from '../../components/Input';
import { Tabs } from '../../components/Tabs';
import { Filters } from '../../components/Filters';
import { useNumbers } from '../../hooks/useNumbers';
import { getRegionForFilter } from '../../utils/regions';
import { matchesNumberSearch } from '../../utils/numberUtils';
import { applyNumberFilters, createEmptyFilters, POSITION_KEYS } from '../../utils/numberFilters';
import styles from './index.module.scss';

const PAGE_SIZE = 20;

const REGION_TABS = [
  { value: 'all', label: 'Все' },
  { value: 'moscow', label: 'Москва' },
  { value: 'region', label: 'Московская область' },
];

function filtersFromState(stateFilters) {
  const next = createEmptyFilters();
  if (!stateFilters) return next;
  POSITION_KEYS.forEach((key) => {
    next[key] = Boolean(stateFilters[key]);
  });
  if (stateFilters.exclusive) next.vip = true;
  next.priceSort = stateFilters.priceSort;
  next.priceMin = stateFilters.priceMin;
  next.priceMax = stateFilters.priceMax;
  return next;
}

export function Numbers() {
  const location = useLocation();
  const { numbers: numbersData, loading: numbersLoading } = useNumbers();
  const stateFilters = location.state?.filters;
  const stateSearch = location.state?.search ?? '';
  const [region, setRegion] = useState(location.state?.region ?? 'all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [search, setSearch] = useState(typeof stateSearch === 'string' ? stateSearch : '');
  const [filters, setFilters] = useState(() => filtersFromState(stateFilters));

  useEffect(() => {
    const fromState = location.state;
    if (fromState?.region === 'moscow' || fromState?.region === 'region' || fromState?.region === 'all') {
      setRegion(fromState.region);
    }
    if (typeof fromState?.search === 'string') setSearch(fromState.search);
    if (fromState?.filters) setFilters(filtersFromState(fromState.filters));
  }, [location.state]);

  const filtered = useMemo(() => {
    const list = numbersData.filter((item) => {
      const numberRegion = getRegionForFilter(item);
      if (region === 'moscow' && numberRegion !== 'Москва') return false;
      if (region === 'region' && numberRegion !== 'Московская область') return false;
      if (search.trim() && !matchesNumberSearch(item.number, item.city, search)) return false;
      return true;
    });
    return applyNumberFilters(list, filters);
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

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Номера</h1>
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
                  <NumberCard item={item} />
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
    </div>
  );
}
