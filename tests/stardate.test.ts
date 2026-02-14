import { describe, it, expect } from 'vitest';

// Test the stardate conversion logic directly

describe('TNG stardate conversion', () => {
  function dateToStardate(date: Date): number {
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
    const fraction = dayOfYear / 365.25;
    const trekYear = year + 338;
    return parseFloat((1000 * (trekYear - 2323) + fraction * 1000).toFixed(1));
  }

  function stardateToTrekYear(sd: number): number {
    return Math.floor(sd / 1000) + 2323;
  }

  it('converts a date to TNG stardate', () => {
    const date = new Date(2026, 0, 1); // Jan 1, 2026
    const sd = dateToStardate(date);
    // 2026 + 338 = 2364, stardate should be ~41000
    expect(sd).toBeGreaterThanOrEqual(41000);
    expect(sd).toBeLessThan(42000);
  });

  it('converts a mid-year date correctly', () => {
    const date = new Date(2026, 5, 15); // June 15, 2026
    const sd = dateToStardate(date);
    // Should be roughly 41000 + ~450 = ~41450
    expect(sd).toBeGreaterThan(41400);
    expect(sd).toBeLessThan(41600);
  });

  it('extracts trek year from stardate', () => {
    expect(stardateToTrekYear(41153.7)).toBe(2364);
    expect(stardateToTrekYear(48315.6)).toBe(2371);
  });

  it('roundtrips approximately', () => {
    const original = new Date(2026, 2, 15);
    const sd = dateToStardate(original);
    const trekYear = stardateToTrekYear(sd);
    expect(trekYear).toBe(2364); // 2026 + 338
  });
});

describe('TOS stardate conversion', () => {
  function dateToTOSStardate(date: Date): number {
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
    const fraction = dayOfYear / 365.25;
    const trekYear = year + 239;
    return parseFloat(((trekYear - 2264) * 1000 + fraction * 1000).toFixed(1));
  }

  it('converts a date to TOS stardate', () => {
    const date = new Date(2026, 0, 1);
    const sd = dateToTOSStardate(date);
    // 2026 + 239 = 2265, (2265-2264)*1000 = 1000
    expect(sd).toBeGreaterThanOrEqual(1000);
    expect(sd).toBeLessThan(2000);
  });
});
