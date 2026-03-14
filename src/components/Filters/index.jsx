import styles from './index.module.scss';

const FILTER_OPTIONS = [
  { key: 'vip', label: 'Эксклюзивный' },
  { key: 'free', label: 'Свободные' },
  { key: 'sameDigits', label: 'Одинаковые цифры' },
  { key: 'sameLetters', label: 'Одинаковые буквы' },
];

export function Filters({ selected, onChange }) {
  return (
    <div className={styles.filters}>
      {FILTER_OPTIONS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`${styles.pill} ${selected[key] ? styles.active : ''}`}
          onClick={() => onChange?.({ ...selected, [key]: !selected[key] })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
