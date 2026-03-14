import styles from './index.module.scss';

const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={styles.icon}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export function Tabs({ tabs, activeValue, onChange }) {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={activeValue === value}
          className={`${styles.tab} ${activeValue === value ? styles.active : ''}`}
          onClick={() => onChange?.(value)}
        >
          <LocationIcon />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
