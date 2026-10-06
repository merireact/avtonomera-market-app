import {
  hasSameLetters,
  hasSameMiddleDigits,
  isFirstTen,
  isRoundHundreds,
} from './numberUtils';

export const FILTER_OPTIONS = [
  { key: 'vip', label: 'Эксклюзивный' },
  { key: 'sameDigits', label: 'Одинаковые цифры' },
  { key: 'sameLetters', label: 'Одинаковые буквы' },
  { key: 'firstTen', label: 'Первая десятка' },
  { key: 'roundHundreds', label: 'Ровные сотни' },
  { key: 'auto', label: 'Под авто' },
  { key: 'other', label: 'Иные' },
];

export const POSITION_KEYS = FILTER_OPTIONS.map((option) => option.key);

const POSITION_MATCHERS = {
  vip: (item) => Boolean(item.vip),
  sameDigits: (item) => hasSameMiddleDigits(item.number),
  sameLetters: (item) => hasSameLetters(item.number),
  firstTen: (item) => isFirstTen(item.number),
  roundHundreds: (item) => isRoundHundreds(item.number),
  auto: (item) => Boolean(item.isAuto),
  other: (item) => Boolean(item.isOther),
};

export function createEmptyFilters() {
  return {
    priceSort: undefined,
    priceMin: undefined,
    priceMax: undefined,
    ...Object.fromEntries(POSITION_KEYS.map((key) => [key, false])),
  };
}

export function isAnyFilterActive(filters) {
  if (!filters) return false;
  if (filters.priceSort) return true;
  if (filters.priceMin != null || filters.priceMax != null) return true;
  return POSITION_KEYS.some((key) => filters[key]);
}

function getPriceNum(item) {
  const price = item?.price;
  if (typeof price === 'number' && Number.isFinite(price)) return price;
  if (typeof price !== 'string') return null;
  const compact = price.trim().replace(/\s/g, '').replace(/₽/g, '');
  if (!compact || compact.toLowerCase() === 'договорная') return null;
  const thousands = compact.match(/^(\d{1,3}(?:\.\d{3})+)$/);
  const n = thousands ? Number(thousands[1].replace(/\./g, '')) : Number(compact.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * Позиции объединяются: номер попадает в список, если подходит хотя бы под одну выбранную.
 * «Авто» и «Иные» смотрят только на отметку админа, а не на формат номера.
 * Диапазон цены сужает уже собранный список, сортировка только упорядочивает его.
 * @param {Array} list
 * @param {object} filters
 * @returns {Array}
 */
export function applyNumberFilters(list, filters) {
  const source = Array.isArray(list) ? list : [];
  const activeKeys = POSITION_KEYS.filter((key) => filters?.[key]);
  let result = activeKeys.length
    ? source.filter((item) => activeKeys.some((key) => POSITION_MATCHERS[key](item)))
    : [...source];

  const priceMin = filters?.priceMin;
  const priceMax = filters?.priceMax;
  if (priceMin != null || priceMax != null) {
    result = result.filter((item) => {
      const price = getPriceNum(item);
      if (price === null) return false;
      if (priceMin != null && price < priceMin) return false;
      if (priceMax != null && price > priceMax) return false;
      return true;
    });
  }

  if (filters?.priceSort === 'asc' || filters?.priceSort === 'desc') {
    const direction = filters.priceSort === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      const priceA = getPriceNum(a);
      const priceB = getPriceNum(b);
      if (priceA === null && priceB === null) return 0;
      if (priceA === null) return 1;
      if (priceB === null) return -1;
      return (priceA - priceB) * direction;
    });
  }

  return result;
}
