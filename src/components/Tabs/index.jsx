import styles from './index.module.scss';

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
          {label}
        </button>
      ))}
    </div>
  );
}
