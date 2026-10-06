const SOURCE_USER_ID = '55597';
const PAGE_SIZE_GUARD = 40;

const MOSCOW_SERIES = new Set([77, 97, 99, 177, 197, 199, 777, 797, 799, 977]);
const MOSCOW_OBLAST_SERIES = new Set([50, 90, 150, 190, 750, 790, 250, 550]);

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

export function plateKey(numberStr) {
  return String(numberStr || '')
    .toLowerCase()
    .split('')
    .map((ch) => PLATE_LETTER_TO_LATIN[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]/g, '');
}

export function cityForRegion(regionCode) {
  const series = Number(regionCode);
  if (MOSCOW_SERIES.has(series)) return 'Москва';
  if (MOSCOW_OBLAST_SERIES.has(series)) return 'Московская область';
  return `Регион ${regionCode}`;
}

export function formatPlate(title, region) {
  const compact = String(title || '').replace(/\s/g, '');
  const body = compact.endsWith(region) ? compact.slice(0, -region.length) : compact;
  return `${body} ${region}`.trim();
}

export function parsePrice(raw) {
  const text = String(raw || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
  if (/договор/i.test(text)) return 'договорная';
  const digits = text.replace(/\D/g, '');
  return digits || '0';
}

function sameMiddleDigits(numberStr) {
  const part = String(numberStr).trim().split(/\s+/)[0] || '';
  const digits = part.slice(1, 4);
  return /^\d{3}$/.test(digits) && digits[0] === digits[1] && digits[1] === digits[2];
}

function sameLetters(numberStr) {
  const part = String(numberStr).trim().split(/\s+/)[0] || '';
  if (part.length < 6) return false;
  const a = part[0];
  const b = part[4];
  const c = part[5];
  return a === b && b === c;
}

export function parseListings(html) {
  if (!html || html.trim() === 'no') return [];
  const parts = html.split(/<a\s+href="\/standart\//i).slice(1);
  const out = [];
  for (const row of parts) {
    const id = row.match(/^(\d+)/)?.[1];
    const title = row.match(/title="([^"]+)"/)?.[1];
    const region = row.match(/table-plate__region-numb">\s*(\d+)/)?.[1];
    if (!id || !title || !region) continue;
    const priceRaw = row.match(/table-price">\s*([^<]+)/)?.[1] || '';
    const date = row.match(/<span>\s*(\d{2}\.\d{2}\.\d{4})/)?.[1] || '';
    const number = formatPlate(title, region);
    out.push({
      externalId: id,
      number,
      city: cityForRegion(region),
      price: parsePrice(priceRaw),
      date,
      sameDigits: sameMiddleDigits(number),
      sameLetters: sameLetters(number),
    });
  }
  return out;
}

function listingTime(date, index) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date || '');
  const base = match
    ? Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 12, 0, 0)
    : Date.now();
  return new Date(base - index * 1000).toISOString();
}

export async function fetchSellerListings(fetchImpl = fetch) {
  const number = encodeURIComponent(JSON.stringify({
    word1: '',
    word2: '',
    word3: '',
    number1: '',
    number2: '',
    number3: '',
    number4: '',
    code: '',
    city: '',
    catid: '',
    type: 'standart',
  }));
  const order = encodeURIComponent('a.`modified`');
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; AvtonomeraMarketSync/1.0)',
    Referer: `https://autonomera777.ru/user?user_id=${SOURCE_USER_ID}`,
    Accept: 'text/html, */*',
  };

  const listings = [];
  const seen = new Set();
  let start = 0;

  for (let page = 0; page < PAGE_SIZE_GUARD; page += 1) {
    const url = `https://autonomera777.ru/ajax/get_numbers.php?number=${number}&type=standart&blog=numbers&userid=${SOURCE_USER_ID}&order=${order}&dir=DESC&start=${start}&item_id=124`;
    const response = await fetchImpl(url, { headers });
    if (!response.ok) {
      throw new Error(`autonomera777 ответил ${response.status}`);
    }
    const html = await response.text();
    if (html.trim() === 'no') {
      return listings.map((item, index) => ({
        ...item,
        createdAt: listingTime(item.date, index),
      }));
    }
    const items = parseListings(html);
    if (items.length === 0) {
      throw new Error('Пустая страница каталога, синхронизация остановлена');
    }
    for (const item of items) {
      if (seen.has(item.externalId)) continue;
      seen.add(item.externalId);
      listings.push(item);
    }
    start += items.length;
  }

  throw new Error('Каталог не закончился, синхронизация остановлена');
}
