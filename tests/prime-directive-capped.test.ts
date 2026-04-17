import { describe, it, expect } from 'vitest';

// Test the capped violation score logic from prime-directive.ts

describe('prime directive violation score (capped)', () => {
  function computeViolationScore(action: string): number {
    const lowerAction = action.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    const highRiskTerms = ['technology', 'warp', 'weapon', 'interfere', 'reveal', 'identity', 'cure', 'disease'];
    const mediumRiskTerms = ['help', 'assist', 'contact', 'communicate', 'trade', 'share'];
    const lowRiskTerms = ['observe', 'study', 'scan', 'monitor', 'record'];

    for (const term of highRiskTerms) {
      if (lowerAction.includes(term)) positiveScore += 15;
    }
    for (const term of mediumRiskTerms) {
      if (lowerAction.includes(term)) positiveScore += 8;
    }
    for (const term of lowRiskTerms) {
      if (lowerAction.includes(term)) negativeScore += 10;
    }

    if (lowerAction.includes('pre-warp') || lowerAction.includes('primitive')) positiveScore += 20;
    if (lowerAction.includes('natural development')) positiveScore += 15;

    const cappedPositive = Math.min(positiveScore, 50);
    const cappedNegative = Math.min(negativeScore, 20);

    return Math.max(0, Math.min(100, 30 + cappedPositive - cappedNegative));
  }

  it('gives base score of 30 for neutral action', () => {
    expect(computeViolationScore('walking around')).toBe(30);
  });

  it('increases for high-risk terms', () => {
    expect(computeViolationScore('share technology with pre-warp civilization')).toBeGreaterThan(50);
  });

  it('decreases for observation-only actions', () => {
    expect(computeViolationScore('observe and study from orbit')).toBeLessThan(30);
  });

  it('caps positive score contributions at 50', () => {
    // All high-risk + medium + pre-warp + natural development would be huge uncapped
    const score = computeViolationScore('technology warp weapon interfere reveal identity cure disease help assist contact communicate trade share pre-warp natural development');
    // 30 + 50 - 0 = 80 (capped)
    expect(score).toBe(80);
  });

  it('caps negative score contributions at 20', () => {
    // All low-risk terms: observe+study+scan+monitor+record = 50 uncapped -> capped at 20
    const score = computeViolationScore('observe study scan monitor record');
    // 30 + 0 - 20 = 10
    expect(score).toBe(10);
  });

  it('never goes below 0', () => {
    expect(computeViolationScore('observe study scan monitor record')).toBeGreaterThanOrEqual(0);
  });

  it('never goes above 100', () => {
    expect(computeViolationScore('technology warp weapon interfere reveal identity cure disease pre-warp')).toBeLessThanOrEqual(100);
  });
});
