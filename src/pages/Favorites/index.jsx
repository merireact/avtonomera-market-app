import styles from './index.module.scss';

export function Favorites() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Избранное</h1>
        <p className={styles.subtitle}>Здесь появятся номера, которые вы добавите в избранное.</p>
      </header>
    </div>
  );
}
