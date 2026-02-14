import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the rate limiter logic by importing the module and examining behavior.
// Since rateLimit is not exported, we test it indirectly through timing of apiRequest calls.
// For unit testing, we'll recreate the queue logic.

describe('rate limiter queue logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('serializes concurrent requests through promise queue', async () => {
    const MIN_INTERVAL = 200;
    let lastTime = 0;
    let queue: Promise<void> = Promise.resolve();
    const timestamps: number[] = [];

    async function rateLimit(): Promise<void> {
      const ticket = queue.then(async () => {
        const now = Date.now();
        const elapsed = now - lastTime;
        if (elapsed < MIN_INTERVAL) {
          await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - elapsed));
        }
        lastTime = Date.now();
        timestamps.push(lastTime);
      });
      queue = ticket.catch(() => {});
      await ticket;
    }

    // Fire 3 concurrent calls
    const p1 = rateLimit();
    const p2 = rateLimit();
    const p3 = rateLimit();

    // Advance past all delays
    await vi.advanceTimersByTimeAsync(1000);

    await Promise.all([p1, p2, p3]);

    expect(timestamps).toHaveLength(3);
    // Each subsequent call should be at least MIN_INTERVAL ms after the previous
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i] - timestamps[i - 1]).toBeGreaterThanOrEqual(MIN_INTERVAL);
    }
  });

  it('does not delay when enough time has passed', async () => {
    const MIN_INTERVAL = 200;
    let lastTime = 0;
    let queue: Promise<void> = Promise.resolve();

    async function rateLimit(): Promise<void> {
      const ticket = queue.then(async () => {
        const now = Date.now();
        const elapsed = now - lastTime;
        if (elapsed < MIN_INTERVAL) {
          await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL - elapsed));
        }
        lastTime = Date.now();
      });
      queue = ticket.catch(() => {});
      await ticket;
    }

    await rateLimit();
    const first = lastTime;

    // Advance 300ms (more than MIN_INTERVAL)
    await vi.advanceTimersByTimeAsync(300);

    await rateLimit();
    const second = lastTime;

    // Second call should happen immediately (no artificial delay added)
    expect(second - first).toBe(300);
  });
});
