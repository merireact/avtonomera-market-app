import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import styles from './index.module.scss';

export function NumberCard({ item, isFavorite: isFavoriteProp, onToggleFavorite: onToggleFavoriteProp }) {
  const navigate = useNavigate();
  const { isFavorite: isFavoriteCtx, toggleFavorite: toggleFavoriteCtx } = useFavorites();
  const isFavorite = isFavoriteProp ?? isFavoriteCtx(item.id);
  const onToggleFavorite = onToggleFavoriteProp ?? (() => toggleFavoriteCtx(item.id));
  const priceFormatted =
    typeof item.price === 'string'
      ? item.price
      : new Intl.NumberFormat('ru-RU').format(item.price) + ' ₽';

  return (
    <article
      className={styles.card}
      onClick={() => navigate(`/numbers/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/numbers/${item.id}`)}
    >
      <div className={styles.left}>
        <button
          type="button"
          className={styles.favorite}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isFavorite ? '#10331d' : 'none'} stroke="#10331d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <div className={styles.info}>
          <div className={styles.number}>{item.number.replace(/\s/g, '')}</div>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.price}>{priceFormatted}</div>
        <span className={styles.arrow} aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </article>
  );
}
