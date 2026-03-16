/**
 * Серии кодов регионов РФ для Москвы и Московской области.
 * По ним определяется, к какому региону относится номер.
 */

/** Серии кодов региона «Москва»: 77, 97, 99, 177, 197, 199, 777, 797, 799, 977 */
export const MOSCOW_SERIES = [77, 97, 99, 177, 197, 199, 777, 797, 799, 977];

/** Серии кодов региона «Московская область»: 50, 90, 150, 190, 750, 790, 250, 550 */
export const MOSCOW_OBLAST_SERIES = [50, 90, 150, 190, 750, 790, 250, 550];

/**
 * Из строки номера вида "Х777СА 777" извлекает код региона (число после пробела).
 * @param {string} numberStr - строка номера, например "Х777СА 777"
 * @returns {number|null} - код региона или null
 */
export function getSeriesFromNumber(numberStr) {
  if (!numberStr || typeof numberStr !== 'string') return null;
  const parts = numberStr.trim().split(/\s+/);
  const code = parts[parts.length - 1];
  const num = parseInt(code, 10);
  return Number.isNaN(num) ? null : num;
}

/**
 * Определяет регион по строке номера (по серии кода региона).
 * @param {string} numberStr - строка номера, например "Х777СА 777"
 * @returns {'Москва'|'Московская область'|null}
 */
export function getRegionByNumber(numberStr) {
  const series = getSeriesFromNumber(numberStr);
  if (series === null) return null;
  if (MOSCOW_SERIES.includes(series)) return 'Москва';
  if (MOSCOW_OBLAST_SERIES.includes(series)) return 'Московская область';
  return null;
}

/**
 * Регион для фильтрации: учитывает сохранённый city (при добавлении номера)
 * и при необходимости — код региона из строки номера.
 * @param {{ number: string, city?: string }} item - объект номера с полями number и city
 * @returns {'Москва'|'Московская область'|null}
 */
export function getRegionForFilter(item) {
  if (item?.city === 'Москва' || item?.city === 'Московская область') return item.city;
  return getRegionByNumber(item?.number ?? '');
}
