import { describe, it, expect } from 'vitest';

// Test holodeck program generation logic

describe('holodeck malfunction probability', () => {
  function computeMalfunctionPct(scenario: string, safetyProtocols: boolean): number {
    const lower = scenario.toLowerCase();
    let pct = 12;
    if (!safetyProtocols) pct += 35;
    if (lower.includes('sentien') || lower.includes('conscious') || /\bartificial intelligence\b|\bai\b/.test(lower)) pct += 25;
    if (lower.includes('villain') || lower.includes('enemy') || lower.includes('moriarty')) pct += 20;
    if (lower.includes('simple') || lower.includes('basic') || lower.includes('relax')) pct -= 8;
    if (lower.includes('combat') || lower.includes('weapon') || lower.includes('battle')) pct += 15;
    return Math.max(3, Math.min(98, pct));
  }

  it('has base malfunction rate of 12%', () => {
    expect(computeMalfunctionPct('a normal program', true)).toBe(12);
  });

  it('increases significantly with safety protocols off', () => {
    const safe = computeMalfunctionPct('a normal program', true);
    const unsafe = computeMalfunctionPct('a normal program', false);
    expect(unsafe).toBe(safe + 35);
  });

  it('increases for sentient characters', () => {
    expect(computeMalfunctionPct('sentient hologram', true)).toBe(37);
  });

  it('increases for Moriarty-type scenarios', () => {
    expect(computeMalfunctionPct('moriarty villain', true)).toBe(32);
  });

  it('decreases for relaxation programs', () => {
    expect(computeMalfunctionPct('simple relaxation', true)).toBe(4);
  });

  it('clamps to minimum 3%', () => {
    expect(computeMalfunctionPct('simple basic relax', true)).toBeGreaterThanOrEqual(3);
  });

  it('clamps to maximum 98%', () => {
    const pct = computeMalfunctionPct('sentient moriarty villain combat weapon battle ai conscious', false);
    expect(pct).toBeLessThanOrEqual(98);
  });

  it('stacks combat risk', () => {
    const peaceful = computeMalfunctionPct('a walk in the park', true);
    const combat = computeMalfunctionPct('combat battle simulation', true);
    expect(combat).toBeGreaterThan(peaceful);
  });
});
