import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_WELCOME,
  catalogMessages,
  formatPrice,
  isNumbersCommand,
  isStartCommand,
  welcomeText,
} from './messages.mjs';

test('isNumbersCommand accepts the command with a bot name', () => {
  assert.equal(isNumbersCommand('/numbers'), true);
  assert.equal(isNumbersCommand('/numbers@nomeramarket_bot'), true);
  assert.equal(isNumbersCommand('/start'), false);
});

test('formatPrice groups thousands', () => {
  assert.equal(formatPrice('4000000'), '4 000 000 ₽');
  assert.equal(formatPrice('договорная'), 'договорная');
  assert.equal(formatPrice(''), 'договорная');
});

test('catalogMessages splits a long list under the telegram limit', () => {
  const rows = Array.from({ length: 200 }, (_, index) => ({
    number: `А${String(index).padStart(3, '0')}АА 777`,
    city: 'Москва',
    price: '1500000',
    status: 'Свободен',
  }));
  const messages = catalogMessages(rows);
  assert.ok(messages.length > 1);
  assert.ok(messages.every((message) => message.length <= 4096));
  assert.match(messages[0], /^Каталог · 200 номеров · 1\//);
  assert.match(messages.at(-1), /200 номеров · \d+\/\d+/);
});

test('catalogMessages reports an empty catalog', () => {
  assert.deepEqual(catalogMessages([]), ['В каталоге пока нет номеров.']);
});

test('isStartCommand accepts /start with a payload or bot name', () => {
  assert.equal(isStartCommand('/start'), true);
  assert.equal(isStartCommand('/start@nomeramarket_bot'), true);
  assert.equal(isStartCommand('/start promo'), true);
  assert.equal(isStartCommand('/numbers'), false);
});

test('welcomeText reuses the bot description and falls back to a default', () => {
  assert.equal(welcomeText('  Привет!  '), 'Привет!');
  assert.equal(welcomeText(''), DEFAULT_WELCOME);
  assert.equal(welcomeText(undefined), DEFAULT_WELCOME);
});
