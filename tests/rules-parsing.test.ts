import { describe, it, expect } from 'vitest';

// Test the regex patterns used in rules-of-acquisition.ts for parsing rules from wikitext
describe('Rules of Acquisition parsing patterns', () => {
  const patterns = [
    /(?:Rule|#)\s*(\d+)\s*[-:–]\s*"?([^"\n]+)"?/gi,
    /\|\s*(\d+)\s*\|\|?\s*"?([^"|"\n]+)"?/g,
    /'''(\d+)'''\s*[-–:]\s*"?([^"\n]+)"?/g,
  ];

  function parseRules(wikitext: string): Array<{ number: number; text: string }> {
    const rules: Array<{ number: number; text: string }> = [];
    for (const pattern of patterns) {
      // Reset lastIndex since these are g-flag regexes
      const re = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = re.exec(wikitext)) !== null) {
        const num = parseInt(match[1], 10);
        const text = match[2].trim().replace(/'+$/, '').replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2');
        if (!rules.some(r => r.number === num)) {
          rules.push({ number: num, text });
        }
      }
    }
    rules.sort((a, b) => a.number - b.number);
    return rules;
  }

  it('parses "Rule N:" format', () => {
    const wikitext = 'Rule 1: Once you have their money, you never give it back';
    const rules = parseRules(wikitext);
    expect(rules).toHaveLength(1);
    expect(rules[0].number).toBe(1);
    expect(rules[0].text).toBe('Once you have their money, you never give it back');
  });

  it('parses "#N -" format', () => {
    const wikitext = '#3 - Never spend more for an acquisition than you have to';
    const rules = parseRules(wikitext);
    expect(rules).toHaveLength(1);
    expect(rules[0].number).toBe(3);
    expect(rules[0].text).toContain('Never spend more');
  });

  it('parses "Rule N:" with quoted text', () => {
    const wikitext = 'Rule 6: "Never allow family to stand in the way of opportunity"';
    const rules = parseRules(wikitext);
    expect(rules).toHaveLength(1);
    expect(rules[0].text).toContain('Never allow family');
  });

  it('parses table row format', () => {
    const wikitext = '| 34 || War is good for business';
    const rules = parseRules(wikitext);
    expect(rules).toHaveLength(1);
    expect(rules[0].number).toBe(34);
    expect(rules[0].text).toContain('War is good for business');
  });

  it('parses bold number format', () => {
    const wikitext = "'''76''' - Every once in a while, declare peace";
    const rules = parseRules(wikitext);
    expect(rules).toHaveLength(1);
    expect(rules[0].number).toBe(76);
  });

  it('deduplicates rules by number', () => {
    const wikitext = `Rule 1: Once you have their money, you never give it back
Rule 1: Duplicate entry`;
    const rules = parseRules(wikitext);
    expect(rules).toHaveLength(1);
  });

  it('sorts rules by number', () => {
    const wikitext = `Rule 34: War is good for business
Rule 1: Once you have their money
Rule 10: Greed is eternal`;
    const rules = parseRules(wikitext);
    expect(rules.map(r => r.number)).toEqual([1, 10, 34]);
  });

  it('strips wiki links from rule text', () => {
    const wikitext = 'Rule 1: Once you have their [[latinum|money]], you never give it back';
    const rules = parseRules(wikitext);
    expect(rules[0].text).toContain('money');
    expect(rules[0].text).not.toContain('[[');
  });

  it('handles en-dash separator', () => {
    const wikitext = 'Rule 35 \u2013 Peace is good for business';
    const rules = parseRules(wikitext);
    expect(rules).toHaveLength(1);
    expect(rules[0].text).toContain('Peace is good');
  });
});
