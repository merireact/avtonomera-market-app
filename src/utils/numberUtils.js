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

/** Латинские и похожие кириллические буквы госномера приводим к одному виду. */
const PLATE_LETTER_TO_LATIN = {
  а: 'a', a: 'a',
  в: 'b', b: 'b',
  е: 'e', e: 'e',
  к: 'k', k: 'k',
  м: 'm', m: 'm',
  н: 'h', h: 'h',
  о: 'o', o: 'o',
  р: 'p', p: 'p',
  с: 'c', c: 'c',
  т: 't', t: 't',
  у: 'y', y: 'y',
  х: 'x', x: 'x',
};

function normalizePlateChars(str) {
  return String(str || '')
    .toLowerCase()
    .split('')
    .map((ch) => PLATE_LETTER_TO_LATIN[ch] ?? ch)
    .join('');
}

/**
 * Ключ номера для сравнения: без пробелов, буквы в одной раскладке.
 * «А777АА 77» и «a777aa77» дают один ключ. Та же логика в SQL-функции plate_key.
 * @param {string} numberStr
 * @returns {string}
 */
export function plateKey(numberStr) {
  return normalizePlateChars(numberStr).replace(/[^a-z0-9]/g, '');
}

/**
 * Полный госномер: буква, три цифры, две буквы, код региона из 2–3 цифр.
 * @param {string} numberStr
 * @returns {boolean}
 */
export function isFullPlate(numberStr) {
  return /^[a-z]\d{3}[a-z]{2}\d{2,3}$/.test(plateKey(numberStr));
}

/**
 * Запрос номера: полный госномер или его часть из букв и цифр.
 * «777» и «А777АА» достаточны, одна буква или цифра — нет.
 * @param {string} numberStr
 * @returns {boolean}
 */
export function isPlateRequest(numberStr) {
  return plateKey(numberStr).length >= 2;
}

/**
 * Фрагмент запроса входит в номер. Та же логика, что strpos в notify_plate_alerts.
 * «777» и «А777АА» подходят к «А777АА 77».
 * @param {string} request
 * @param {string} numberStr
 * @returns {boolean}
 */
export function matchesPlateRequest(request, numberStr) {
  const query = plateKey(request);
  const key = plateKey(numberStr);
  if (query.length < 2 || !key) return false;
  return key.includes(query);
}

/**
 * Три буквы номера подряд: первая и две после цифр. «А831АА 777» → «ААА».
 * @param {string} numberStr
 * @returns {string}
 */
export function getPlateLetters(numberStr) {
  if (!numberStr || typeof numberStr !== 'string') return '';
  const part = numberStr.trim().split(/\s+/)[0] || '';
  if (part.length >= 6 && /^\d{3}$/.test(part.slice(1, 4))) {
    return part[0] + part[4] + part[5];
  }
  return part.replace(/\d/g, '');
}

/**
 * Поиск по номеру и городу.
 * Запрос из одних букв сравнивается с буквами номера, а не со всей строкой:
 * «ААА» находит «А831АА 777», хотя в строке буквы разделены цифрами.
 * @param {string} numberStr
 * @param {string} city
 * @param {string} query
 * @returns {boolean}
 */
export function matchesNumberSearch(numberStr, city, query) {
  const raw = (query || '').trim();
  if (!raw) return true;

  const compact = normalizePlateChars(raw).replace(/[\s.\-_*]+/g, '');
  // В номере три буквы. Короткий буквенный запрос ищет их, а не город:
  // «ААА» → «А831АА», «Москва» остаётся поиском по названию города.
  if (compact.length > 0 && compact.length <= 3 && /^[a-z]+$/.test(compact)) {
    const letters = normalizePlateChars(getPlateLetters(numberStr));
    return letters.includes(compact);
  }

  const q = normalizePlateChars(raw);
  const numberNorm = normalizePlateChars(numberStr);
  const cityNorm = normalizePlateChars(city);
  return numberNorm.includes(q) || cityNorm.includes(q);
}
