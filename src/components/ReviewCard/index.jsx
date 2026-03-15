import styles from './index.module.scss';

function Stars({ count }) {
  return (
    <span className={styles.stars} aria-label={`Рейтинг: ${count} из 5`}>
      {'★'.repeat(count)}
    </span>
  );
}

export function ReviewCard({ id, name, rating, text, date, onDelete }) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.meta}>
          <div className={styles.name}>{name}</div>
          <Stars count={rating} />
        </div>
        {onDelete && id != null && (
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => onDelete(id)}
            aria-label="Удалить отзыв"
            title="Удалить отзыв"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        )}
      </div>
      <p className={styles.text}>«{text}»</p>
      <div className={styles.date}>{date}</div>
    </article>
  );
}
