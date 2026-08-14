import { describe, it, expect } from 'vitest';
import { equipmentFor } from '../js/game/equipment.js';
import { LEVELS } from '../js/data/levels.js';

describe('equipmentFor', () => {
  it('always shows a knife on the chop station, regardless of level', () => {
    for (const level of LEVELS) {
      expect(equipmentFor(level.id, 'chop')).toEqual({ icon: '🔪', ambient: 'chop' });
    }
  });

  it('always shows plates on the plate station, regardless of level', () => {
    for (const level of LEVELS) {
      expect(equipmentFor(level.id, 'plate')).toEqual({ icon: '🍽️', ambient: 'plate' });
    }
  });

  it('shows a steamer with steam for Mushipan', () => {
    expect(equipmentFor('mushipan', 'cook')).toEqual({ icon: '🫕', ambient: 'steam' });
  });

  it('shows a fryer with flame for the fried-roll levels', () => {
    expect(equipmentFor('rollosEmpanizados', 'cook').ambient).toBe('flame');
    expect(equipmentFor('rollosVip', 'cook').ambient).toBe('flame');
    expect(equipmentFor('banderillas', 'cook').ambient).toBe('flame');
  });

  it('falls back to a generic stove for a level with no special equipment', () => {
    expect(equipmentFor('nivel-inventado', 'cook')).toEqual({ icon: '🔥', ambient: 'flame' });
  });

  it('gives every real level a defined cook equipment', () => {
    for (const level of LEVELS) {
      const eq = equipmentFor(level.id, 'cook');
      expect(eq.icon).toBeTruthy();
      expect(['flame', 'steam']).toContain(eq.ambient);
    }
  });
});
