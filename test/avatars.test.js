import { describe, it, expect } from 'vitest';
import { CUSTOMER_FACES, moodFor, cookFor, COOK_AVATARS } from '../js/game/avatars.js';

describe('moodFor', () => {
  it('is happy when the customer just arrived', () => {
    expect(moodFor(1).emoji).toBe('😃');
    expect(moodFor(0.7).emoji).toBe('😃');
  });

  it('gets progressively worse as patience drains', () => {
    expect(moodFor(0.5).label).toBe('esperando');
    expect(moodFor(0.3).label).toBe('impaciente');
    expect(moodFor(0.1).label).toBe('enojado');
  });

  it('is angry at zero patience', () => {
    expect(moodFor(0).emoji).toBe('😠');
  });

  it('never returns undefined, even for out-of-range input', () => {
    expect(moodFor(-1)).toBeDefined();
    expect(moodFor(2)).toBeDefined();
  });
});

describe('avatars', () => {
  it('offers several distinct customer faces', () => {
    expect(CUSTOMER_FACES.length).toBeGreaterThan(5);
    expect(new Set(CUSTOMER_FACES).size).toBe(CUSTOMER_FACES.length);
  });

  it('has a cook for every station type', () => {
    expect(cookFor('chop')).toBe(COOK_AVATARS.chop);
    expect(cookFor('cook')).toBe(COOK_AVATARS.cook);
    expect(cookFor('plate')).toBe(COOK_AVATARS.plate);
  });

  it('falls back to a default cook for an unknown station', () => {
    expect(cookFor('inventada')).toBeTruthy();
  });
});
