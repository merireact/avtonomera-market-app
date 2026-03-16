/**
 * Номер формата: 1 буква + 3 цифры + 2 буквы, пробел, код региона.
 * Пример: "Х777СА 777", "K999PE 99".
 */

/**
 * Проверяет, что все три цифры в середине номера одинаковые (111, 777, 999 и т.д.).
 * @param {string} numberStr - строка номера, например "Х777СА 777"
 * @returns {boolean}
 */
export function hasSameMiddleDigits(numberStr) {
  if (!numberStr || typeof numberStr !== 'string') return false;
  const part = numberStr.trim().split(/\s+/)[0];
  if (!part || part.length < 4) return false;
  const digits = part.slice(1, 4); // три цифры в середине
  if (!/^\d{3}$/.test(digits)) return false;
  return digits[0] === digits[1] && digits[1] === digits[2];
}

/**
 * Проверяет, что все три буквы в номере одинаковые (первая и две в конце): например А111АА, О006ОО.
 * @param {string} numberStr - строка номера, например "А111АА 77"
 * @returns {boolean}
 */
export function hasSameLetters(numberStr) {
  if (!numberStr || typeof numberStr !== 'string') return false;
  const part = numberStr.trim().split(/\s+/)[0];
  if (!part || part.length < 6) return false;
  const letter1 = part[0];
  const letter2 = part[4];
  const letter3 = part[5];
  if (!/^[А-ЯA-Zа-яa-z]$/.test(letter1) || !/^[А-ЯA-Zа-яa-z]$/.test(letter2) || !/^[А-ЯA-Zа-яa-z]$/.test(letter3)) return false;
  return letter1 === letter2 && letter2 === letter3;
}

/**
 * Возвращает числовое значение трёх цифр в середине номера (1–999) или null.
 * @param {string} numberStr - строка номера, например "М001РН 790"
 * @returns {number|null}
 */
export function getMiddleDigitsNumber(numberStr) {
  if (!numberStr || typeof numberStr !== 'string') return null;
  const part = numberStr.trim().split(/\s+/)[0];
  if (!part || part.length < 4) return null;
  const digits = part.slice(1, 4);
  if (!/^\d{3}$/.test(digits)) return null;
  return parseInt(digits, 10);
}

/**
 * Первая десятка: средние цифры номера 001–010.
 * @param {string} numberStr - строка номера
 * @returns {boolean}
 */
export function isFirstTen(numberStr) {
  const n = getMiddleDigitsNumber(numberStr);
  return n != null && n >= 1 && n <= 10;
}

/**
 * Ровные сотни: средние цифры номера 100, 200, 300, … 900.
 * @param {string} numberStr - строка номера
 * @returns {boolean}
 */
export function isRoundHundreds(numberStr) {
  const n = getMiddleDigitsNumber(numberStr);
  return n != null && n >= 100 && n <= 900 && n % 100 === 0;
}
