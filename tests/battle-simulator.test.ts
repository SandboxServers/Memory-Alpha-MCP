import { describe, it, expect } from 'vitest';

// Test the combat score computation logic directly

describe('combat score computation', () => {
  function computeCombatScore(info: Record<string, string>): number {
    let score = 50;
    const text = Object.values(info).join(' ').toLowerCase();

    const phaserCount = (text.match(/phaser/g) || []).length;
    const torpedoCount = (text.match(/torpedo/g) || []).length;
    const disruptorCount = (text.match(/disruptor/g) || []).length;
    score += phaserCount * 8 + torpedoCount * 10 + disruptorCount * 9;

    if (text.includes('shield')) score += 15;
    if (text.includes('ablative')) score += 20;
    if (text.includes('regenerative')) score += 18;
    if (text.includes('warp 9') || text.includes('warp nine')) score += 10;
    if (text.includes('transwarp')) score += 25;
    if (text.includes('cloak')) score += 20;
    if (text.includes('borg')) score += 30;
    if (text.includes('quantum torpedo')) score += 15;

    const crewMatch = text.match(/(\d{3,})\s*(?:crew|personnel|complement)/);
    if (crewMatch) score += Math.min(parseInt(crewMatch[1], 10) / 50, 30);

    return score;
  }

  it('gives base score for empty info', () => {
    expect(computeCombatScore({})).toBe(50);
  });

  it('scores higher for more weapons', () => {
    const light = computeCombatScore({ armament: '2 phaser banks' });
    const heavy = computeCombatScore({ armament: '12 phaser arrays, 3 torpedo launchers, quantum torpedo' });
    expect(heavy).toBeGreaterThan(light);
  });

  it('adds score for shields', () => {
    const noShield = computeCombatScore({});
    const withShield = computeCombatScore({ defense: 'shield generators' });
    expect(withShield).toBeGreaterThan(noShield);
  });

  it('adds score for cloaking', () => {
    const nocloak = computeCombatScore({});
    const cloaked = computeCombatScore({ special: 'cloaking device' });
    expect(cloaked).toBe(nocloak + 20);
  });

  it('adds score for Borg tech', () => {
    const normal = computeCombatScore({});
    const borg = computeCombatScore({ affiliation: 'Borg Collective' });
    expect(borg).toBe(normal + 30);
  });

  it('adds score for large crew', () => {
    const small = computeCombatScore({ crew: '50 crew' });
    const large = computeCombatScore({ crew: '1000 crew complement' });
    expect(large).toBeGreaterThan(small);
  });
});
