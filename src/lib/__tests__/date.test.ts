import { describe, expect, it } from 'vitest';
import { dateFromKey, localDateKey } from '../date';
import { shiftMonth } from '../productivity';

describe('local date helpers', () => {
  it('formats calendar dates in the local timezone', () => {
    expect(localDateKey(new Date(2026, 6, 16, 23, 30))).toBe('2026-07-16');
  });

  it('parses a calendar key without applying a UTC offset', () => {
    const date = dateFromKey('2026-07-16');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6);
    expect(date.getDate()).toBe(16);
  });
});

describe('shiftMonth', () => {
  it('does not skip February when moving from January 31', () => {
    const result = shiftMonth(new Date(2026, 0, 31), 1);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(1);
  });
});
