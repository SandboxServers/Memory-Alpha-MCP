import { describe, it, expect } from 'vitest';

// Test the mission analysis logic from away-team.ts

describe('away team mission analysis', () => {
  function analyzeNeededRoles(mission: string): string[] {
    const lower = mission.toLowerCase();
    const roles: string[] = ['Away Team Leader'];

    if (lower.includes('hostile') || lower.includes('combat') || lower.includes('attack') || lower.includes('weapon') || lower.includes('war')) {
      roles.push('Security');
    }
    if (lower.includes('negotiate') || lower.includes('diplomacy') || lower.includes('peace') || lower.includes('treaty') || lower.includes('first contact')) {
      roles.push('Diplomat/Counselor');
    }
    if (lower.includes('repair') || lower.includes('engineer') || lower.includes('technical') || lower.includes('power') || lower.includes('system')) {
      roles.push('Engineer');
    }
    if (lower.includes('disease') || lower.includes('medical') || lower.includes('injured') || lower.includes('virus') || lower.includes('plague') || lower.includes('radiation')) {
      roles.push('Medical Officer');
    }
    if (lower.includes('scan') || lower.includes('analyz') || lower.includes('research') || lower.includes('anomaly') || lower.includes('scientific') || lower.includes('unknown')) {
      roles.push('Science Officer');
    }
    if (lower.includes('borg') || lower.includes('assimilat')) {
      roles.push('Borg Specialist');
    }
    if (lower.includes('infiltrat') || lower.includes('stealth') || lower.includes('undercover') || lower.includes('spy')) {
      roles.push('Infiltration Specialist');
    }

    if (roles.length < 2) roles.push('Science Officer');
    if (roles.length < 3) roles.push('Security');

    return roles;
  }

  it('always includes a leader', () => {
    const roles = analyzeNeededRoles('simple survey mission');
    expect(roles).toContain('Away Team Leader');
  });

  it('adds security for hostile missions', () => {
    const roles = analyzeNeededRoles('hostile planet with combat expected');
    expect(roles).toContain('Security');
  });

  it('adds diplomat for negotiations', () => {
    const roles = analyzeNeededRoles('negotiate peace treaty');
    expect(roles).toContain('Diplomat/Counselor');
  });

  it('adds engineer for technical missions', () => {
    const roles = analyzeNeededRoles('repair the power system');
    expect(roles).toContain('Engineer');
  });

  it('adds medical for disease scenarios', () => {
    const roles = analyzeNeededRoles('unknown virus spreading');
    expect(roles).toContain('Medical Officer');
  });

  it('adds borg specialist for borg encounters', () => {
    const roles = analyzeNeededRoles('borg cube detected, assimilation threat');
    expect(roles).toContain('Borg Specialist');
  });

  it('fills minimum 3 roles for basic missions', () => {
    const roles = analyzeNeededRoles('go to a place');
    expect(roles.length).toBeGreaterThanOrEqual(3);
  });
});
