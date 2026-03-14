import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { NumberCard } from '../../components/NumberCard';
import { Tabs } from '../../components/Tabs';
import { FilterModal } from '../../components/FilterModal';
import { ReviewCard } from '../../components/ReviewCard';
import numbersData from '../../data/numbers.json';
import reviewsData from '../../data/reviews.json';
import styles from './index.module.scss';

const REGION_TABS = [
  { value: 'moscow', label: 'Москва' },
  { value: 'region', label: 'Московская область' },
];

function getPriceNum(item) {
  const p = item.price;
  if (typeof p === 'number') return p;
  return null; // договорная
}

export function Home() {
  const navigate = useNavigate();
  const [region, setRegion] = useState('moscow');
  const [search, setSearch] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filterValues, setFilterValues] = useState({
    priceSort: undefined,
    priceMin: undefined,
    priceMax: undefined,
  });

  const featuredNumbers = useMemo(() => {
    let list = numbersData.filter((n) => {
      if (region === 'moscow' && n.city !== 'Москва') return false;
      if (region === 'region' && n.city !== 'Московская область') return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!n.number.toLowerCase().includes(q) && !n.city.toLowerCase().includes(q)) return false;
      }
      return true;
    }).filter((n) => n.beautiful);

    const { priceMin, priceMax, priceSort } = filterValues;
    if (priceMin != null || priceMax != null) {
      list = list.filter((n) => {
        const num = getPriceNum(n);
        if (num === null) return false;
        if (priceMin != null && num < priceMin) return false;
        if (priceMax != null && num > priceMax) return false;
        return true;
      });
    }
    if (priceSort === 'asc') {
      list = [...list].sort((a, b) => {
        const pa = getPriceNum(a);
        const pb = getPriceNum(b);
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1;
        if (pb === null) return -1;
        return pa - pb;
      });
    } else if (priceSort === 'desc') {
      list = [...list].sort((a, b) => {
        const pa = getPriceNum(a);
        const pb = getPriceNum(b);
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1;
        if (pb === null) return -1;
        return pb - pa;
      });
    }
    return list.slice(0, 8);
  }, [region, search, filterValues]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>Автономера</div>
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
            {(filterValues.priceSort || filterValues.priceMin != null || filterValues.priceMax != null) && (
              <span className={styles.filterBadge} aria-hidden />
            )}
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
          <ul className={styles.cardList}>
            {featuredNumbers.map((item) => (
              <li key={item.id}>
                <NumberCard item={item} />
              </li>
            ))}
          </ul>
          <div className={styles.showMore}>
            <Button onClick={() => navigate('/numbers')}>Показать больше номеров</Button>
          </div>
        </section>

        <section className={styles.reviews}>
          <h2 className={styles.sectionTitle}>Отзывы</h2>
          <div className={styles.reviewsScroll}>
            {reviewsData.map((review) => (
              <div key={review.id} className={styles.reviewCardWrap}>
                <ReviewCard {...review} />
              </div>
            ))}
          </div>
          <div className={styles.leaveReview}>
            <Button variant="secondary" onClick={() => {}}>Оставить отзыв</Button>
          </div>
        </section>
      </main>
    </div>
  );
}
