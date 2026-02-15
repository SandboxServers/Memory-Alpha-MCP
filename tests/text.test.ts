import { describe, it, expect } from 'vitest';
import { truncate, stripHtml, cleanWikitext, stripTemplates, processTemplates, formatKey, escapeMdTableCell } from '../src/utils/text.js';

describe('truncate', () => {
  it('returns short text unchanged', () => {
    expect(truncate('Hello world', 100)).toBe('Hello world');
  });

  it('truncates long text at sentence boundary', () => {
    const text = 'First sentence. Second sentence. Third sentence. Fourth sentence.';
    const result = truncate(text, 40);
    expect(result).toContain('First sentence.');
    expect(result).toContain('[...truncated]');
  });

  it('truncates at maxLength when no sentence boundary found', () => {
    const text = 'A'.repeat(100);
    const result = truncate(text, 50);
    expect(result.length).toBeLessThanOrEqual(70); // 50 + truncated marker
  });
});

describe('stripHtml', () => {
  it('removes ref tags with content', () => {
    expect(stripHtml('Hello<ref name="foo">citation</ref> world')).toBe('Hello world');
  });

  it('removes self-closing ref tags', () => {
    expect(stripHtml('Hello<ref name="foo" /> world')).toBe('Hello world');
  });

  it('removes generic HTML tags', () => {
    expect(stripHtml('<b>bold</b> and <i>italic</i>')).toBe('bold and italic');
  });

  it('decodes HTML entities', () => {
    expect(stripHtml('A &amp; B &lt; C &gt; D &quot;E&quot;')).toBe('A & B < C > D "E"');
  });
});

describe('cleanWikitext', () => {
  it('removes File/Image links', () => {
    expect(cleanWikitext('Text [[File:Image.jpg|thumb]] here')).toBe('Text  here');
  });

  it('removes Category links', () => {
    expect(cleanWikitext('Text [[Category:Starships]] here')).toBe('Text  here');
  });

  it('converts piped wiki links to display text', () => {
    expect(cleanWikitext('[[USS Enterprise|Enterprise]]')).toBe('Enterprise');
  });

  it('converts simple wiki links', () => {
    expect(cleanWikitext('[[Warp drive]]')).toBe('Warp drive');
  });

  it('strips templates using brace-balanced matching', () => {
    expect(cleanWikitext('Before {{template|arg}} after')).toBe('Before  after');
  });

  it('handles nested templates', () => {
    expect(cleanWikitext('Before {{outer|{{inner}}}} after')).toBe('Before  after');
  });

  it('strips interlanguage links', () => {
    expect(cleanWikitext('Text [[de:Defiant]] end')).toBe('Text  end');
    expect(cleanWikitext('[[es:14 febrero]]')).toBe('');
    expect(cleanWikitext('Content\n[[de:Defiant]]\n[[ja:USSディファイアント]]')).not.toContain('[[');
  });

  it('strips bold/italic markup', () => {
    expect(cleanWikitext("'''bold''' and ''italic''")).toBe('bold and italic');
  });
});

describe('stripTemplates', () => {
  it('removes simple templates', () => {
    expect(stripTemplates('A {{foo}} B')).toBe('A  B');
  });

  it('removes nested templates', () => {
    expect(stripTemplates('A {{foo|{{bar|baz}}}} B')).toBe('A  B');
  });

  it('removes multiple templates', () => {
    expect(stripTemplates('{{a}} middle {{b}}')).toBe(' middle ');
  });

  it('handles unbalanced braces gracefully', () => {
    const result = stripTemplates('A {{ unclosed');
    expect(result).toBe('A ');
  });

  it('preserves text without templates', () => {
    expect(stripTemplates('no templates here')).toBe('no templates here');
  });

  it('handles templates with } inside values', () => {
    expect(stripTemplates('A {{tmpl|value with } char}} B')).toBe('A  B');
  });
});

describe('processTemplates', () => {
  it('converts {{USS|Enterprise}} to "USS Enterprise"', () => {
    expect(processTemplates('The {{USS|Enterprise}} was launched.')).toBe('The USS Enterprise was launched.');
  });

  it('converts {{USS|Enterprise|NCC-1701}} to "USS Enterprise (NCC-1701)"', () => {
    expect(processTemplates('The {{USS|Enterprise|NCC-1701}} was a starship.')).toBe('The USS Enterprise (NCC-1701) was a starship.');
  });

  it('converts {{class|Galaxy}} to "Galaxy-class"', () => {
    expect(processTemplates('A {{class|Galaxy}} vessel.')).toBe('A Galaxy-class vessel.');
  });

  it('converts {{quote|text|speaker}} to quoted text with attribution', () => {
    expect(processTemplates('{{quote|Make it so|Picard}}')).toBe('"Make it so" – Picard');
  });

  it('converts {{dis|name}} and {{aka|name}} to plain name', () => {
    expect(processTemplates('{{dis|Enterprise}}')).toBe('Enterprise');
    expect(processTemplates('{{aka|Number One}}')).toBe('Number One');
  });

  it('converts series episode templates to episode names', () => {
    expect(processTemplates('Filming on {{TNG|The Inner Light}}.')).toBe('Filming on The Inner Light.');
    expect(processTemplates('{{DS9|In the Pale Moonlight}} airs.')).toBe('In the Pale Moonlight airs.');
    expect(processTemplates('{{VOY|Endgame}} premieres.')).toBe('Endgame premieres.');
    expect(processTemplates('{{ENT|Twilight}} was great.')).toBe('Twilight was great.');
  });

  it('converts {{e|Episode}} to episode name', () => {
    expect(processTemplates('Filming on {{e|Encounter at Farpoint}}.')).toBe('Filming on Encounter at Farpoint.');
  });

  it('converts {{film|N}} to film title', () => {
    expect(processTemplates('Filming on {{film|8}}.')).toBe('Filming on Star Trek: First Contact.');
    expect(processTemplates('{{film|2}} was released.')).toBe('Star Trek II: The Wrath of Khan was released.');
  });

  it('converts {{y|YYYY}} to year string', () => {
    expect(processTemplates('In {{y|1987}}, TNG premiered.')).toBe('In 1987, TNG premiered.');
  });

  it('converts {{s|Title}} to title string', () => {
    expect(processTemplates('{{s|Star Trek: The Next Generation}} aired.')).toBe('Star Trek: The Next Generation aired.');
  });
});

describe('formatKey', () => {
  it('converts underscores to spaces and capitalizes words', () => {
    expect(formatKey('home_world')).toBe('Home World');
  });

  it('handles single word', () => {
    expect(formatKey('name')).toBe('Name');
  });
});

describe('escapeMdTableCell', () => {
  it('escapes pipe characters', () => {
    expect(escapeMdTableCell('A | B | C')).toBe('A \\| B \\| C');
  });

  it('leaves text without pipes unchanged', () => {
    expect(escapeMdTableCell('no pipes')).toBe('no pipes');
  });
});
