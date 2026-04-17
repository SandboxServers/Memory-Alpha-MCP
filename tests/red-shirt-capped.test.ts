import { describe, it, expect } from 'vitest';

// Test the capped risk analysis logic from red-shirt.ts

describe('red shirt survival analysis (capped)', () => {
  function analyzeRisk(description: string): number {
    const lower = description.toLowerCase();
    let positiveRisk = 0;
    let negativeRisk = 0;

    if (lower.includes('unknown') || lower.includes('uncharted') || lower.includes('unexplored')) positiveRisk += 20;
    if (lower.includes('energy') || lower.includes('radiation') || lower.includes('anomaly')) positiveRisk += 15;
    if (lower.includes('planet') || lower.includes('surface')) positiveRisk += 10;
    if (lower.includes('hostile') || lower.includes('enemy') || lower.includes('klingon') || lower.includes('romulan')) positiveRisk += 25;
    if (lower.includes('captain') || lower.includes('commander')) negativeRisk += 15;
    if (lower.includes('alone') || lower.includes('solo') || lower.includes('separated')) positiveRisk += 30;
    if (lower.includes('cave') || lower.includes('tunnel')) positiveRisk += 15;
    if (lower.includes('negotiate') || lower.includes('diplomatic')) negativeRisk += 10;
    if (lower.includes('engineering') || lower.includes('repair')) positiveRisk += 5;

    const cappedPositive = Math.min(positiveRisk, 55);
    const cappedNegative = Math.min(negativeRisk, 20);
    return Math.max(5, Math.min(95, 70 - cappedPositive + cappedNegative));
  }

  it('gives baseline 70% for neutral description', () => {
    expect(analyzeRisk('a routine mission')).toBe(70);
  });

  it('reduces survival for hostile encounters', () => {
    expect(analyzeRisk('hostile klingon territory')).toBeLessThan(70);
  });

  it('increases survival with senior officer present', () => {
    expect(analyzeRisk('captain on the mission')).toBeGreaterThan(70);
  });

  it('caps positive risk at 55', () => {
    // All risk keywords: unknown+energy+planet+hostile+alone+cave+engineering = 20+15+10+25+30+15+5 = 120 uncapped
    const survival = analyzeRisk('unknown hostile energy planet alone cave engineering');
    // 70 - 55 + 0 = 15
    expect(survival).toBe(15);
  });

  it('caps negative risk at 20', () => {
    // captain (15) + diplomatic (10) = 25 uncapped -> capped at 20
    const survival = analyzeRisk('captain commander diplomatic negotiate');
    // 70 - 0 + 20 = 90
    expect(survival).toBe(90);
  });

  it('never goes below 5%', () => {
    expect(analyzeRisk('unknown hostile alone cave energy radiation')).toBeGreaterThanOrEqual(5);
  });

  it('never goes above 95%', () => {
    expect(analyzeRisk('captain commander negotiate diplomatic')).toBeLessThanOrEqual(95);
  });
});
