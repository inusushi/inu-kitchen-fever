import { describe, it, expect } from 'vitest';
import { spawnOrder } from '../js/game/Order.js';
import { LEVELS } from '../js/data/levels.js';

const level = (over = {}) => ({ recipeIds: ['musashiRoll', 'donKangrejo'], ...over });

describe('spawnOrder', () => {
  it('returns a single dish when the level only allows size 1', () => {
    const order = spawnOrder(level({ orderSizes: [1] }));
    expect(order).toHaveLength(1);
    expect(order[0].id).toBeDefined();
  });

  it('respects the requested order size', () => {
    // rng fijo en 0 -> siempre elige el primer tamaño y la primera receta
    const order = spawnOrder(level({ orderSizes: [3] }), () => 0);
    expect(order).toHaveLength(3);
    expect(order.every((r) => r.id === 'musashiRoll')).toBe(true);
  });

  it('falls back to a single dish when the level declares no sizes', () => {
    expect(spawnOrder(level())).toHaveLength(1);
    expect(spawnOrder(level({ orderSizes: [] }))).toHaveLength(1);
  });

  it('only ever picks recipes the level declares', () => {
    const allowed = new Set(['musashiRoll', 'donKangrejo']);
    for (let i = 0; i < 50; i++) {
      for (const r of spawnOrder(level({ orderSizes: [1, 2, 3] }))) {
        expect(allowed.has(r.id)).toBe(true);
      }
    }
  });

  it('produces real recipe objects with a price for every level', () => {
    for (const lvl of LEVELS) {
      for (const r of spawnOrder(lvl)) {
        expect(r, `${lvl.id} generó una receta inexistente`).toBeDefined();
        expect(typeof r.price).toBe('number');
      }
    }
  });
});

describe('progresión de dificultad', () => {
  it('starts with single-dish orders and grows later', () => {
    expect(LEVELS[0].orderSizes).toEqual([1]);
    expect(Math.max(...LEVELS.at(-1).orderSizes)).toBeGreaterThan(1);
  });

  it('never asks for more dishes than the tables a player can have', () => {
    // 2 mesas base + hasta 2 por la mejora "Mesa extra" = 4 como máximo.
    for (const lvl of LEVELS) {
      expect(Math.max(...(lvl.orderSizes || [1])), `${lvl.id} pide de más`).toBeLessThanOrEqual(4);
    }
  });
});
