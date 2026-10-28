const MESSAGE_LIMIT = 3800;

export function formatPrice(price) {
  const raw = String(price ?? '').trim();
  if (!raw || raw.toLowerCase() === 'договорная') return 'договорная';
  const digits = raw.replace(/\s/g, '').replace(/₽/g, '');
  if (/^\d+$/.test(digits)) {
    return `${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`;
  }
  return raw;
}

function numberWord(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return 'номер';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'номера';
  return 'номеров';
}

export function formatNumberLine(row) {
  const number = String(row?.number ?? '').trim() || '—';
  const city = String(row?.city ?? '').trim();
  const status = String(row?.status ?? '').trim();
  return [number, city, formatPrice(row?.price), status].filter(Boolean).join(' — ');
}

function commandName(text) {
  return String(text ?? '').trim().split(/\s+/)[0]?.split('@')[0]?.toLowerCase();
}

export function isNumbersCommand(text) {
  return commandName(text) === '/numbers';
}

export function isStartCommand(text) {
  return commandName(text) === '/start';
}

export const DEFAULT_WELCOME = 'Добро пожаловать в Номера Маркет! Откройте каталог, чтобы выбрать красивый номер.';

// На телефоне Telegram показывает описание бота в пустом чате, а на компьютере
// после старта чата его не видно, поэтому повторяем тот же текст в ответ на /start.
export function welcomeText(description) {
  const text = String(description ?? '').trim();
  return text || DEFAULT_WELCOME;
}

export function catalogMessages(rows) {
  const lines = (rows || []).map(formatNumberLine);
  if (lines.length === 0) return ['В каталоге пока нет номеров.'];

  const titleLength = `Каталог · ${lines.length} ${numberWord(lines.length)} · 99/99`.length;
  const parts = [];
  let current = [];

  for (const line of lines) {
    const next = [...current, line].join('\n');
    if (current.length > 0 && titleLength + 2 + next.length > MESSAGE_LIMIT) {
      parts.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) parts.push(current);

  return parts.map((part, index) => {
    const title = parts.length > 1
      ? `Каталог · ${lines.length} ${numberWord(lines.length)} · ${index + 1}/${parts.length}`
      : `Каталог · ${lines.length} ${numberWord(lines.length)}`;
    return `${title}\n\n${part.join('\n')}`;
  });
}
