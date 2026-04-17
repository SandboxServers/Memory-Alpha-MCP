import { describe, it, expect } from 'vitest';

// Test the check-trivia-answer matching logic

describe('trivia answer checking', () => {
  function checkAnswer(playerAnswer: string, correctAnswer: string): boolean {
    const normalizedPlayer = playerAnswer.trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();
    const correctLetter = normalizedCorrect.match(/^([a-d])\)/)?.[1];
    const correctTitle = normalizedCorrect.replace(/^[a-d]\)\s*/i, '').trim().toLowerCase();

    return (
      normalizedPlayer === normalizedCorrect ||
      normalizedPlayer === correctLetter ||
      normalizedPlayer === correctTitle ||
      normalizedPlayer.replace(/[^a-z0-9]/g, '') === correctTitle.replace(/[^a-z0-9]/g, '')
    );
  }

  it('matches exact answer', () => {
    expect(checkAnswer('B) USS Enterprise', 'B) USS Enterprise')).toBe(true);
  });

  it('matches letter only', () => {
    expect(checkAnswer('b', 'B) USS Enterprise')).toBe(true);
  });

  it('matches title only', () => {
    expect(checkAnswer('USS Enterprise', 'B) USS Enterprise')).toBe(true);
  });

  it('matches case-insensitively', () => {
    expect(checkAnswer('uss enterprise', 'B) USS Enterprise')).toBe(true);
  });

  it('matches with whitespace/punctuation differences', () => {
    expect(checkAnswer('uss-enterprise', 'B) USS Enterprise')).toBe(true);
  });

  it('rejects wrong letter', () => {
    expect(checkAnswer('A', 'B) USS Enterprise')).toBe(false);
  });

  it('rejects wrong title', () => {
    expect(checkAnswer('USS Defiant', 'B) USS Enterprise')).toBe(false);
  });

  it('handles plain correct answers without letter prefix', () => {
    expect(checkAnswer('Bajoran wormhole', 'Bajoran wormhole')).toBe(true);
  });
});
