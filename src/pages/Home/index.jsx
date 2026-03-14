import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { NumberCard } from '../../components/NumberCard';
import { Tabs } from '../../components/Tabs';
import { Filters } from '../../components/Filters';
import { ReviewCard } from '../../components/ReviewCard';
import numbersData from '../../data/numbers.json';
import reviewsData from '../../data/reviews.json';
import styles from './index.module.scss';

const REGION_TABS = [
  { value: 'moscow', label: 'Москва' },
  { value: 'region', label: 'Московская область' },
];

export function Home() {
  const navigate = useNavigate();
  const [region, setRegion] = useState('moscow');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    vip: false,
    beautiful: false,
    free: false,
    sameDigits: false,
    sameLetters: false,
  });
  const [favorites, setFavorites] = useState(new Set());

  const featuredNumbers = useMemo(() => {
    return numbersData
      .filter((n) => {
        if (region === 'moscow' && n.city !== 'Москва') return false;
        if (region === 'region' && n.city !== 'Московская область') return false;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          if (!n.number.toLowerCase().includes(q) && !n.city.toLowerCase().includes(q)) return false;
        }
        if (filters.vip && !n.vip) return false;
        if (filters.beautiful && !n.beautiful) return false;
        if (filters.free && n.status !== 'Свободен') return false;
        if (filters.sameDigits && !n.sameDigits) return false;
        if (filters.sameLetters && !n.sameLetters) return false;
        return true;
      })
      .filter((n) => n.beautiful)
      .slice(0, 8);
  }, [region, search, filters]);

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
        <div className={styles.logo}>Автономера</div>
        <Tabs tabs={REGION_TABS} activeValue={region} onChange={setRegion} />
      </header>

      <main className={styles.main}>
        <div className={styles.search}>
          <Input placeholder="Поиск номера..." value={search} onChange={setSearch} />
        </div>

        <section className={styles.filtersSection}>
          <Filters selected={filters} onChange={setFilters} />
        </section>

        <section className={styles.featured}>
          <h2 className={styles.sectionTitle}>Избранные номера</h2>
          <ul className={styles.cardList}>
            {featuredNumbers.map((item) => (
              <li key={item.id}>
                <NumberCard
                  item={item}
                  isFavorite={favorites.has(item.id)}
                  onToggleFavorite={toggleFavorite}
                />
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
              <ReviewCard key={review.id} {...review} />
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
