import { useMemo } from 'react';
import { useFavorites } from '../../context/FavoritesContext';
import { NumberCard } from '../../components/NumberCard';
import numbersData from '../../data/numbers.json';
import styles from './index.module.scss';

export function Favorites() {
  const { favorites } = useFavorites();

  const favoriteItems = useMemo(() => {
    const ids = new Set(favorites);
    return numbersData.filter((n) => ids.has(n.id));
  }, [favorites]);

  const isEmpty = favoriteItems.length === 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Избранное</h1>
        <p className={styles.subtitle}>
          {isEmpty
            ? 'Здесь появятся номера, которые вы добавите в избранное.'
            : `Добавлено номеров: ${favoriteItems.length}`}
        </p>
      </header>

      {isEmpty ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon} aria-hidden>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <p className={styles.emptyText}>Нажмите на сердечко у номера, чтобы добавить его сюда</p>
        </div>
      ) : (
        <main className={styles.main}>
          <ul className={styles.list}>
            {favoriteItems.map((item) => (
              <li key={item.id}>
                <NumberCard item={item} />
              </li>
            ))}
          </ul>
        </main>
      )}
    </div>
  );
}
