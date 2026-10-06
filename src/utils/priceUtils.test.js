import { formatPriceRub, isPriceDrop, numericPrice } from './priceUtils';

test('numericPrice reads plain and formatted numbers', () => {
  expect(numericPrice(400000)).toBe(400000);
  expect(numericPrice('400 000')).toBe(400000);
  expect(numericPrice('договорная')).toBeNull();
  expect(numericPrice('')).toBeNull();
});

test('isPriceDrop is true only when the new numeric price is lower', () => {
  expect(isPriceDrop('400000', '350000')).toBe(true);
  expect(isPriceDrop(100, 100)).toBe(false);
  expect(isPriceDrop(100, 120)).toBe(false);
  expect(isPriceDrop('договорная', '100000')).toBe(false);
  expect(isPriceDrop('100000', 'договорная')).toBe(false);
});

test('formatPriceRub uses a ruble sign for numeric prices', () => {
  expect(formatPriceRub(350000).replace(/\s/g, ' ')).toBe('350 000 ₽');
  expect(formatPriceRub('договорная')).toBe('договорная');
});
