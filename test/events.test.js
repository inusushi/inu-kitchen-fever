import { describe, it, expect } from 'vitest';
import { SEASONAL_EVENTS, activeEventFor } from '../js/data/events.js';

const sample = [
  { id: 'a', name: 'Evento A', emoji: '🎉', start: '2026-05-08', end: '2026-05-10', coinMultiplier: 1.5, message: 'x' },
  { id: 'b', name: 'Evento B', emoji: '🎊', start: '2026-12-01', end: '2026-12-31', coinMultiplier: 2, message: 'y' },
];

describe('SEASONAL_EVENTS', () => {
  it('ships empty — nadie inventa fechas ni promociones reales aquí', () => {
    expect(SEASONAL_EVENTS).toEqual([]);
  });
});

describe('activeEventFor', () => {
  it('finds nothing when no event is configured', () => {
    expect(activeEventFor('2026-05-09', [])).toBeNull();
  });

  it('is inclusive on both the start and end date', () => {
    expect(activeEventFor('2026-05-08', sample)?.id).toBe('a');
    expect(activeEventFor('2026-05-10', sample)?.id).toBe('a');
  });

  it('finds nothing the day right before or after the range', () => {
    expect(activeEventFor('2026-05-07', sample)).toBeNull();
    expect(activeEventFor('2026-05-11', sample)).toBeNull();
  });

  it('finds the right event when several are configured', () => {
    expect(activeEventFor('2026-12-15', sample)?.id).toBe('b');
  });

  it('returns null between two non-overlapping events', () => {
    expect(activeEventFor('2026-08-13', sample)).toBeNull();
  });
});
