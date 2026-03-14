import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Input } from '../Input';
import styles from './index.module.scss';

const SORT_OPTIONS = [
  { value: 'asc', label: 'Сначала дешевые' },
  { value: 'desc', label: 'Сначала дорогие' },
];

const CHECKBOX_FILTERS = [
  { key: 'exclusive', label: 'Эксклюзивный' },
  { key: 'free', label: 'Свободные' },
  { key: 'sameDigits', label: 'Одинаковые цифры' },
  { key: 'sameLetters', label: 'Одинаковые буквы' },
];

export function FilterModal({ open, onClose, value, onChange }) {
  const [sort, setSort] = useState(value?.priceSort ?? '');
  const [minPrice, setMinPrice] = useState(value?.priceMin ?? '');
  const [maxPrice, setMaxPrice] = useState(value?.priceMax ?? '');
  const [exclusive, setExclusive] = useState(value?.exclusive ?? false);
  const [free, setFree] = useState(value?.free ?? false);
  const [sameDigits, setSameDigits] = useState(value?.sameDigits ?? false);
  const [sameLetters, setSameLetters] = useState(value?.sameLetters ?? false);

  useEffect(() => {
    if (open) {
      setSort(value?.priceSort ?? '');
      setMinPrice(value?.priceMin != null ? String(value.priceMin) : '');
      setMaxPrice(value?.priceMax != null ? String(value.priceMax) : '');
      setExclusive(value?.exclusive ?? false);
      setFree(value?.free ?? false);
      setSameDigits(value?.sameDigits ?? false);
      setSameLetters(value?.sameLetters ?? false);
    }
  }, [open, value?.priceSort, value?.priceMin, value?.priceMax, value?.exclusive, value?.free, value?.sameDigits, value?.sameLetters]);

  const handleApply = () => {
    const numMin = minPrice === '' ? undefined : Number(minPrice);
    const numMax = maxPrice === '' ? undefined : Number(maxPrice);
    onChange?.({
      priceSort: sort || undefined,
      priceMin: numMin,
      priceMax: numMax,
      exclusive,
      free,
      sameDigits,
      sameLetters,
    });
    onClose?.();
  };

  const handleReset = () => {
    setSort('');
    setMinPrice('');
    setMaxPrice('');
    setExclusive(false);
    setFree(false);
    setSameDigits(false);
    setSameLetters(false);
    onChange?.({
      priceSort: undefined,
      priceMin: undefined,
      priceMax: undefined,
      exclusive: false,
      free: false,
      sameDigits: false,
      sameLetters: false,
    });
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
            {CHECKBOX_FILTERS.map(({ key, label }) => {
              const checked = key === 'exclusive' ? exclusive : key === 'free' ? free : key === 'sameDigits' ? sameDigits : sameLetters;
              const setChecked = key === 'exclusive' ? setExclusive : key === 'free' ? setFree : key === 'sameDigits' ? setSameDigits : setSameLetters;
              return (
                <label key={key} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>{label}</span>
                </label>
              );
            })}
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
