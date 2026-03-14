import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Input } from '../Input';
import styles from './index.module.scss';

const SORT_OPTIONS = [
  { value: 'asc', label: 'Сначала дешевые' },
  { value: 'desc', label: 'Сначала дорогие' },
];

export function FilterModal({ open, onClose, value, onChange }) {
  const [sort, setSort] = useState(value?.priceSort ?? '');
  const [minPrice, setMinPrice] = useState(value?.priceMin ?? '');
  const [maxPrice, setMaxPrice] = useState(value?.priceMax ?? '');

  useEffect(() => {
    if (open) {
      setSort(value?.priceSort ?? '');
      setMinPrice(value?.priceMin != null ? String(value.priceMin) : '');
      setMaxPrice(value?.priceMax != null ? String(value.priceMax) : '');
    }
  }, [open, value?.priceSort, value?.priceMin, value?.priceMax]);

  const handleApply = () => {
    const numMin = minPrice === '' ? undefined : Number(minPrice);
    const numMax = maxPrice === '' ? undefined : Number(maxPrice);
    onChange?.({
      priceSort: sort || undefined,
      priceMin: numMin,
      priceMax: numMax,
    });
    onClose?.();
  };

  const handleReset = () => {
    setSort('');
    setMinPrice('');
    setMaxPrice('');
    onChange?.({ priceSort: undefined, priceMin: undefined, priceMax: undefined });
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
