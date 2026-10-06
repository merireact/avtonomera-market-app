/**
 * Числовая цена номера. «договорная» и пустые значения — не число.
 * @param {unknown} value
 * @returns {number|null}
 */
export function numericPrice(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value == null) return null;
  const s = String(value).trim().toLowerCase().replace(/\s/g, '').replace(',', '.');
  if (!s || s === 'договорная') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Цена снизилась, если обе стороны — числа и новая меньше предыдущей.
 * @param {unknown} oldPrice
 * @param {unknown} newPrice
 * @returns {boolean}
 */
export function isPriceDrop(oldPrice, newPrice) {
  const prev = numericPrice(oldPrice);
  const next = numericPrice(newPrice);
  return prev != null && next != null && next < prev;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function formatPriceRub(value) {
  const n = numericPrice(value);
  if (n == null) return value == null ? '' : String(value);
  return `${new Intl.NumberFormat('ru-RU').format(n)} ₽`;
}
