import { describe, expect, it } from 'vitest';
import { dateFromKey, localDateKey } from '../date';

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
