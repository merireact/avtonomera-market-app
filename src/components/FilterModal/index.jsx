import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Input } from '../Input';
import { FILTER_OPTIONS, POSITION_KEYS, createEmptyFilters } from '../../utils/numberFilters';
import styles from './index.module.scss';

const SORT_OPTIONS = [
  { value: 'asc', label: 'Сначала дешевые' },
  { value: 'desc', label: 'Сначала дорогие' },
];

function positionsFromValue(value) {
  return Object.fromEntries(POSITION_KEYS.map((key) => [key, Boolean(value?.[key])]));
}

export function FilterModal({ open, onClose, value, onChange }) {
  const [sort, setSort] = useState(value?.priceSort ?? '');
  const [minPrice, setMinPrice] = useState(value?.priceMin ?? '');
  const [maxPrice, setMaxPrice] = useState(value?.priceMax ?? '');
  const [positions, setPositions] = useState(() => positionsFromValue(value));

  useEffect(() => {
    if (!open) return;
    setSort(value?.priceSort ?? '');
    setMinPrice(value?.priceMin != null ? String(value.priceMin) : '');
    setMaxPrice(value?.priceMax != null ? String(value.priceMax) : '');
    setPositions(positionsFromValue(value));
  }, [open, value]);

  const handleApply = () => {
    const numMin = minPrice === '' ? undefined : Number(minPrice);
    const numMax = maxPrice === '' ? undefined : Number(maxPrice);
    onChange?.({
      ...createEmptyFilters(),
      ...positions,
      priceSort: sort || undefined,
      priceMin: Number.isFinite(numMin) ? numMin : undefined,
      priceMax: Number.isFinite(numMax) ? numMax : undefined,
    });
    onClose?.();
  };

  const handleReset = () => {
    const empty = createEmptyFilters();
    setSort('');
    setMinPrice('');
    setMaxPrice('');
    setPositions(positionsFromValue(empty));
    onChange?.(empty);
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title="Фильтры">
      <div className={styles.body}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Сортировка по цене</legend>
          <div className={styles.radioGroup}>
            {SORT_OPTIONS.map((opt) => (
              <label key={opt.value} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="priceSort"
                  value={opt.value}
                  checked={sort === opt.value}
                  onChange={() => setSort(opt.value)}
                  className={styles.radio}
                />
                <span className={styles.radioText}>{opt.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Параметры</legend>
          <div className={styles.checkboxGroup}>
            {FILTER_OPTIONS.map(({ key, label }) => (
              <label key={key} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={Boolean(positions[key])}
                  onChange={() => setPositions((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Диапазон цен (₽)</legend>
          <div className={styles.rangeRow}>
            <div className={styles.rangeField}>
              <label className={styles.label}>От</label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={setMinPrice}
                className={styles.input}
              />
            </div>
            <div className={styles.rangeField}>
              <label className={styles.label}>До</label>
              <Input
                type="number"
                placeholder="Не указано"
                value={maxPrice}
                onChange={setMaxPrice}
                className={styles.input}
              />
            </div>
          </div>
        </fieldset>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleReset}>
            Сбросить
          </Button>
          <Button onClick={handleApply}>Применить</Button>
        </div>
      </div>
    </Modal>
  );
}
