import { FILTER_OPTIONS } from '../../utils/numberFilters';
import styles from './index.module.scss';

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
