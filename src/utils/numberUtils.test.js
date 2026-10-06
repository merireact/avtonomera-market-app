import { isFullPlate, isPlateRequest, matchesPlateRequest } from './numberUtils';

test('a plate request can be a fragment of a full plate', () => {
  expect(isFullPlate('777')).toBe(false);
  expect(isFullPlate('А777АА')).toBe(false);
  expect(isPlateRequest('777')).toBe(true);
  expect(isPlateRequest('А777АА')).toBe(true);
  expect(isPlateRequest('А777АА 77')).toBe(true);
  expect(isPlateRequest('7')).toBe(false);
  expect(isPlateRequest('')).toBe(false);
});

test('a fragment matches a catalog plate that contains it', () => {
  expect(matchesPlateRequest('777', 'А777АА 77')).toBe(true);
  expect(matchesPlateRequest('А777АА', 'А777АА 77')).toBe(true);
  expect(matchesPlateRequest('а777аа 77', 'A777AA 77')).toBe(true);
  expect(matchesPlateRequest('888', 'А777АА 77')).toBe(false);
  expect(matchesPlateRequest('7', 'А777АА 77')).toBe(false);
});
