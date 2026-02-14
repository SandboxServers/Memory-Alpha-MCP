import { describe, it, expect } from 'vitest';
import { truncate, stripHtml, cleanWikitext, stripTemplates, formatKey, escapeMdTableCell } from '../src/utils/text.js';

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
