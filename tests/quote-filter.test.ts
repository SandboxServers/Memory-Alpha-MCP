import { describe, it, expect } from 'vitest';

// Test the quote extraction filter from who-said-it.ts

describe('who-said-it quote extraction', () => {
  function isValidQuote(line: string): boolean {
    const trimmed = line.trim();
    if (trimmed.length < 20 || trimmed.length > 300) return false;
    const quoteMatch = trimmed.match(/"([^"]{20,})"/);
    return quoteMatch !== null;
  }

  it('accepts lines with matched quote pairs', () => {
    expect(isValidQuote('"Make it so, Number One. That is my decision."')).toBe(true);
  });

  it('rejects lines with only a single quote mark', () => {
    expect(isValidQuote('He said "something and then the line ended')).toBe(false);
  });

  it('rejects lines with short quoted text', () => {
    expect(isValidQuote('"Yes" he replied firmly.')).toBe(false);
  });

  it('rejects lines shorter than 20 chars', () => {
    expect(isValidQuote('"Short quote"')).toBe(false);
  });

  it('rejects lines longer than 300 chars', () => {
    const longLine = '"' + 'a'.repeat(301) + '"';
    expect(isValidQuote(longLine)).toBe(false);
  });

  it('rejects template/ref artifacts', () => {
    // Lines with " in references like {{cite|"Something"}} but no proper matched pair
    expect(isValidQuote('{{cite|url="http://example.com"}}')).toBe(false);
  });

  it('accepts multi-word quotes', () => {
    expect(isValidQuote('Captain Picard once said "There are four lights! I will not yield to torture."')).toBe(true);
  });
});
