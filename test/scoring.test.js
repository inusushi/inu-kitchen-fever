import { describe, it, expect } from 'vitest';
import { calculateStars } from '../js/game/scoring.js';

describe('calculateStars', () => {
  const goals = [100, 200, 300];

  it('gives 0 stars below the first goal', () => {
    expect(calculateStars(50, goals)).toBe(0);
    expect(calculateStars(99, goals)).toBe(0);
  });

  it('gives 1 star at or above the first goal', () => {
    expect(calculateStars(100, goals)).toBe(1);
    expect(calculateStars(199, goals)).toBe(1);
  });

  it('gives 2 stars at or above the second goal', () => {
    expect(calculateStars(200, goals)).toBe(2);
    expect(calculateStars(299, goals)).toBe(2);
  });

  it('gives 3 stars at or above the third goal', () => {
    expect(calculateStars(300, goals)).toBe(3);
    expect(calculateStars(9999, goals)).toBe(3);
  });
});
