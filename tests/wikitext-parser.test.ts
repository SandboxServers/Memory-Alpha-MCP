import { describe, it, expect } from 'vitest';
import { parseWikitext } from '../src/parser/wikitext.js';

describe('parseWikitext disambiguation detection', () => {
  it('detects {{disambig}} as disambiguation', () => {
    const wikitext = `'''Twilight''' may refer to:\n* [[Twilight (episode)|Twilight]]\n* [[Twilight (novel)|Twilight]]\n{{disambig}}`;
    const result = parseWikitext(wikitext, 'Twilight');
    expect(result.isDisambiguation).toBe(true);
  });

  it('detects {{dis}} as disambiguation', () => {
    const wikitext = `'''Darmok''' may refer to:\n* [[Darmok (episode)|Darmok]]\n{{dis}}`;
    const result = parseWikitext(wikitext, 'Darmok');
    expect(result.isDisambiguation).toBe(true);
  });

  it('detects {{disambiguation}} as disambiguation', () => {
    const wikitext = `'''Test''' may refer to:\n* [[Test A]]\n{{disambiguation}}`;
    const result = parseWikitext(wikitext, 'Test');
    expect(result.isDisambiguation).toBe(true);
  });

  it('does NOT flag {{disambiguate}} hatnote as disambiguation', () => {
    const wikitext = `{{disambiguate|Jean-Luc Picard (mirror)|the mirror universe counterpart}}\n'''Jean-Luc Picard''' was a Starfleet captain.`;
    const result = parseWikitext(wikitext, 'Jean-Luc Picard');
    expect(result.isDisambiguation).toBe(false);
  });

  it('does NOT flag {{disambiguate|...}} with params as disambiguation', () => {
    const wikitext = `{{disambiguate|Twilight (TNG episode)|the TNG episode}}\n'''Twilight''' was an episode of Enterprise.`;
    const result = parseWikitext(wikitext, 'Twilight (episode)');
    expect(result.isDisambiguation).toBe(false);
  });

  it('does NOT flag {{dis|target}} hatnote as disambiguation', () => {
    const wikitext = `{{dis|Darmok|the disambiguation page}}\n'''Darmok''' was the fifth episode of TNG Season 5.`;
    const result = parseWikitext(wikitext, 'Darmok (episode)');
    expect(result.isDisambiguation).toBe(false);
  });

  it('does NOT flag {{disambiguation|desc|target}} hatnote as disambiguation', () => {
    const wikitext = `{{disambiguation|the DS9 novel|Twilight (novel)|rd=Twilight}}\nThe episode content here.`;
    const result = parseWikitext(wikitext, 'Twilight (episode)');
    expect(result.isDisambiguation).toBe(false);
  });

  it('detects {{ep disambiguation|TNG}} as disambiguation', () => {
    const wikitext = `{{ep disambiguation|TNG}}\n'''Darmok''' may refer to:\n* [[Darmok (episode)|the episode]]`;
    const result = parseWikitext(wikitext, 'Darmok');
    expect(result.isDisambiguation).toBe(true);
  });

  it('detects (disambiguation) in title', () => {
    const wikitext = `This is a disambiguation page.`;
    const result = parseWikitext(wikitext, 'Enterprise (disambiguation)');
    expect(result.isDisambiguation).toBe(true);
  });

  it('does NOT flag {{DIS}} (Star Trek: Discovery abbreviation) as disambiguation', () => {
    const wikitext = `*{{DIS}}\n**{{e|The Vulcan Hello}}\n'''Vulcans''' were a species.\n[[Category:Species]]`;
    const result = parseWikitext(wikitext, 'Vulcan');
    expect(result.isDisambiguation).toBe(false);
  });

  it('does NOT flag {{Disambiguation link}} hatnote as disambiguation', () => {
    const wikitext = `{{Disambiguation link}}\n'''Vulcans''' were a warp-capable humanoid species.`;
    const result = parseWikitext(wikitext, 'Vulcan');
    expect(result.isDisambiguation).toBe(false);
  });
});

describe('parseWikitext links extraction', () => {
  it('extracts links as strings, not objects', () => {
    const wikitext = `See [[Jean-Luc Picard]] and [[USS Enterprise|Enterprise]].`;
    const result = parseWikitext(wikitext, 'Test');
    expect(result.links.length).toBeGreaterThan(0);
    for (const link of result.links) {
      expect(typeof link).toBe('string');
      expect(link).not.toBe('[object Object]');
    }
  });

  it('extracts page names from links', () => {
    const wikitext = `[[Jean-Luc Picard]] commanded the [[USS Enterprise (NCC-1701-D)|Enterprise-D]].`;
    const result = parseWikitext(wikitext, 'Test');
    expect(result.links).toContain('Jean-Luc Picard');
    expect(result.links).toContain('USS Enterprise (NCC-1701-D)');
  });
});
