import styles from './index.module.scss';

function Stars({ count }) {
  return (
    <span className={styles.stars} aria-label={`Рейтинг: ${count} из 5`}>
      {'★'.repeat(count)}
    </span>
  );
}

export function ReviewCard({ name, rating, text, date }) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.meta}>
          <div className={styles.name}>{name}</div>
          <Stars count={rating} />
        </div>
      </div>
      <p className={styles.text}>«{text}»</p>
      <div className={styles.date}>{date}</div>
    </article>
  );
}
