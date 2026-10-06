import { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { NumberCard } from '../../components/NumberCard';
import { Tabs } from '../../components/Tabs';
import { FilterModal } from '../../components/FilterModal';
import { ValuationModal } from '../../components/ValuationModal';
import { useNumbers } from '../../hooks/useNumbers';
import { getRegionForFilter } from '../../utils/regions';
import { matchesNumberSearch } from '../../utils/numberUtils';
import { applyNumberFilters, createEmptyFilters, isAnyFilterActive } from '../../utils/numberFilters';
import styles from './index.module.scss';

const REGION_TABS = [
  { value: 'moscow', label: 'Москва' },
  { value: 'region', label: 'Московская область' },
];

const PAGE_STEP = 8;
const PHONE_HREF = 'tel:+79995999177';
const TELEGRAM_URL = 'https://t.me/nomeramarket_direct';

export function Home() {
  const { numbers: numbersData, loading: numbersLoading } = useNumbers();
  const [region, setRegion] = useState('moscow');
  const [search, setSearch] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [valuationOpen, setValuationOpen] = useState(false);
  const [filterValues, setFilterValues] = useState(createEmptyFilters);
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);

  useEffect(() => {
    setVisibleCount(PAGE_STEP);
  }, [region, search, filterValues]);

  const filteredNumbers = useMemo(() => {
    const list = numbersData.filter((item) => {
      const numberRegion = getRegionForFilter(item);
      if (region === 'moscow' && numberRegion !== 'Москва') return false;
      if (region === 'region' && numberRegion !== 'Московская область') return false;
      if (search.trim() && !matchesNumberSearch(item.number, item.city, search)) return false;
      return true;
    });
    return applyNumberFilters(list, filterValues);
  }, [numbersData, region, search, filterValues]);

  const visibleNumbers = filteredNumbers.slice(0, visibleCount);
  const hasMore = visibleCount < filteredNumbers.length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandName}>Avtonomera Market</span>
        </div>
        <Tabs tabs={REGION_TABS} activeValue={region} onChange={setRegion} />
      </header>

      <main className={styles.main}>
        <div className={styles.searchRow}>
          <Input placeholder="Поиск номера..." value={search} onChange={setSearch} className={styles.searchInput} />
          <button
            type="button"
            className={styles.filterBtn}
            onClick={() => setFilterModalOpen(true)}
            aria-label="Открыть фильтры"
            title="Фильтры"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {isAnyFilterActive(filterValues) && <span className={styles.filterBadge} aria-hidden />}
          </button>
        </div>

        <FilterModal
          open={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
          value={filterValues}
          onChange={setFilterValues}
        />

        <section className={styles.featured}>
          <h2 className={styles.sectionTitle}>Лучшие номера</h2>
          {numbersLoading ? (
            <p className={styles.reviewsLoading}>Загрузка номеров...</p>
          ) : (
            <>
              {visibleNumbers.length === 0 ? (
                <p className={styles.reviewsLoading}>Нет номеров по выбранным фильтрам</p>
              ) : (
                <ul className={styles.cardList}>
                  {visibleNumbers.map((item) => (
                    <li key={item.id}>
                      <NumberCard item={item} />
                    </li>
                  ))}
                </ul>
              )}
              {hasMore && (
                <div className={styles.showMore}>
                  <Button onClick={() => setVisibleCount((count) => count + PAGE_STEP)} className={styles.showMoreBtn}>
                    <span className={styles.btnIcon} aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    </span>
                    Показать больше номеров
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        <section className={styles.contacts}>
          <h2 className={styles.sectionTitle}>Контакты</h2>
          <div className={styles.contactActions}>
            <a href={PHONE_HREF} className={styles.contactBtn}>
              <span>+7 999 599-91-77</span>
            </a>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className={styles.contactBtn}>
              <span>@nomeramarket_direct</span>
            </a>
          </div>
          <Button variant="secondary" onClick={() => setValuationOpen(true)} className={styles.valuationBtn}>
            Оценка вашего номера
          </Button>
        </section>
      </main>

      <ValuationModal open={valuationOpen} onClose={() => setValuationOpen(false)} />
    </div>
  );
}
