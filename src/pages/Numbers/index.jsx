import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NumberCard } from '../../components/NumberCard';
import { Input } from '../../components/Input';
import { Tabs } from '../../components/Tabs';
import { Filters } from '../../components/Filters';
import { useNumbers } from '../../hooks/useNumbers';
import { getRegionForFilter } from '../../utils/regions';
import { hasSameMiddleDigits, hasSameLetters, isFirstTen, isRoundHundreds } from '../../utils/numberUtils';
import styles from './index.module.scss';

const PAGE_SIZE = 20;

const REGION_TABS = [
  { value: 'all', label: 'Все' },
  { value: 'moscow', label: 'Москва' },
  { value: 'region', label: 'Московская область' },
];

export function Numbers() {
  const location = useLocation();
  const { numbers: numbersData, loading: numbersLoading } = useNumbers();
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
    firstTen: stateFilters?.firstTen ?? false,
    roundHundreds: stateFilters?.roundHundreds ?? false,
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
        firstTen: fromState.filters.firstTen ?? false,
        roundHundreds: fromState.filters.roundHundreds ?? false,
      });
    }
  }, [location.state]);

  const filtered = useMemo(() => {
    if (!numbersData.length) return [];
    return numbersData.filter((item) => {
      const numberRegion = getRegionForFilter(item);
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
      if (filters.firstTen && !isFirstTen(item.number)) return false;
      if (filters.roundHundreds && !isRoundHundreds(item.number)) return false;
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
