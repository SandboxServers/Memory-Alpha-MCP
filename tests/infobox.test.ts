import { describe, it, expect } from 'vitest';
import { extractSidebarFromWikitext } from '../src/parser/infobox.js';

describe('extractSidebarFromWikitext', () => {
  it('extracts sidebar with specific type', () => {
    const wikitext = `Some text
{{sidebar starship
| name = USS Enterprise
| class = Constitution
| registry = NCC-1701
}}
More text`;
    const result = extractSidebarFromWikitext(wikitext, 'starship');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('USS Enterprise');
    expect(result!.class).toBe('Constitution');
    expect(result!.registry).toBe('NCC-1701');
  });

  it('extracts sidebar without specifying type', () => {
    const wikitext = `{{sidebar episode
| title = The Best of Both Worlds
| season = 3
}}`;
    const result = extractSidebarFromWikitext(wikitext);
    expect(result).not.toBeNull();
    expect(result!.title).toBe('The Best of Both Worlds');
  });

  it('returns null when no sidebar found', () => {
    const result = extractSidebarFromWikitext('Just plain text here', 'starship');
    expect(result).toBeNull();
  });

  it('handles nested templates inside sidebar', () => {
    const wikitext = `{{sidebar starship
| name = {{USS|Enterprise}}
| class = Constitution
}}`;
    const result = extractSidebarFromWikitext(wikitext, 'starship');
    expect(result).not.toBeNull();
    expect(result!.class).toBe('Constitution');
  });

  it('handles multi-word template types', () => {
    const wikitext = `{{sidebar space station
| name = Deep Space 9
| type = Cardassian
}}`;
    const result = extractSidebarFromWikitext(wikitext, 'space station');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('Deep Space 9');
  });

  it('returns null for empty sidebar', () => {
    const wikitext = `{{sidebar starship}}`;
    const result = extractSidebarFromWikitext(wikitext, 'starship');
    expect(result).toBeNull();
  });
});
