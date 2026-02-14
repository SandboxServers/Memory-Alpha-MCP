import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TTLCache } from '../src/utils/cache.js';

describe('TTLCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores and retrieves values', () => {
    const cache = new TTLCache<string>(60_000, 10);
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('returns undefined for missing keys', () => {
    const cache = new TTLCache<string>(60_000, 10);
    expect(cache.get('missing')).toBeUndefined();
  });

  it('expires entries after TTL', () => {
    const cache = new TTLCache<string>(1000, 10);
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');

    vi.advanceTimersByTime(1001);
    expect(cache.get('key')).toBeUndefined();
  });

  it('evicts LRU when at capacity', () => {
    const cache = new TTLCache<string>(60_000, 2);
    cache.set('a', '1');
    vi.advanceTimersByTime(10);
    cache.set('b', '2');
    vi.advanceTimersByTime(10);

    // Access 'a' to make it more recently used
    cache.get('a');
    vi.advanceTimersByTime(10);

    // Adding 'c' should evict 'b' (least recently used)
    cache.set('c', '3');

    expect(cache.get('a')).toBe('1');
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBe('3');
  });

  it('clears all entries', () => {
    const cache = new TTLCache<string>(60_000, 10);
    cache.set('a', '1');
    cache.set('b', '2');
    cache.clear();
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeUndefined();
  });
});
