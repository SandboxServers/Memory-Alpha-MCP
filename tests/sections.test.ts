import { describe, it, expect } from 'vitest';
import { extractSection, extractIntro, listSectionHeadings } from '../src/parser/sections.js';

const SAMPLE_WIKITEXT = `'''Jean-Luc Picard''' was a Starfleet captain.

He commanded the USS Enterprise-D.

== Early life ==
Picard was born in La Barre, France.

== Starfleet career ==
He graduated from Starfleet Academy.

=== Command of the Enterprise ===
In 2364, Picard was given command.

== Personal life ==
Picard enjoyed Earl Grey tea.`;

describe('extractSection', () => {
  it('extracts a section by heading', () => {
    const result = extractSection(SAMPLE_WIKITEXT, 'Early life');
    expect(result).not.toBeNull();
    expect(result).toContain('La Barre');
  });

  it('is case-insensitive', () => {
    const result = extractSection(SAMPLE_WIKITEXT, 'early life');
    expect(result).not.toBeNull();
    expect(result).toContain('La Barre');
  });

  it('returns null for non-existent section', () => {
    const result = extractSection(SAMPLE_WIKITEXT, 'Nonexistent');
    expect(result).toBeNull();
  });
});

describe('extractIntro', () => {
  it('extracts intro text before first section', () => {
    const result = extractIntro(SAMPLE_WIKITEXT);
    expect(result).toContain('Picard');
    expect(result).toContain('Starfleet captain');
    expect(result).not.toContain('La Barre');
  });
});

describe('listSectionHeadings', () => {
  it('lists all section headings', () => {
    const headings = listSectionHeadings(SAMPLE_WIKITEXT);
    expect(headings).toContain('Early life');
    expect(headings).toContain('Starfleet career');
    expect(headings).toContain('Personal life');
  });
});
