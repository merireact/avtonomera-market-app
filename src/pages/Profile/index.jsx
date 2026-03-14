import styles from './index.module.scss';

export function Profile() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Профиль</h1>
        <p className={styles.subtitle}>Раздел в разработке.</p>
      </header>
    </div>
  );
}
