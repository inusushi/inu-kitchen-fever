import { describe, it, expect } from 'vitest';
import {
  CUSTOMER_TYPES,
  pickCustomerType,
  isRushHour,
  RUSH_SPAWN_FACTOR,
} from '../js/game/customerTypes.js';
import { patienceForOrder } from '../js/game/customerTypes.js';
import { LEVELS } from '../js/data/levels.js';
import { RECIPES } from '../js/data/recipes.js';

describe('pickCustomerType', () => {
  it('always returns normal when the level allows nothing else', () => {
    const level = { customerTypes: { normal: 1 } };
    for (let i = 0; i < 20; i++) {
      expect(pickCustomerType(level).id).toBe('normal');
    }
  });

  it('falls back to normal when the level declares no types', () => {
    expect(pickCustomerType({}).id).toBe('normal');
    expect(pickCustomerType({ customerTypes: {} }).id).toBe('normal');
  });

  it('ignores types with zero weight', () => {
    const level = { customerTypes: { normal: 1, vip: 0 } };
    for (let i = 0; i < 20; i++) {
      expect(pickCustomerType(level).id).not.toBe('vip');
    }
  });

  it('respects the declared weights', () => {
    const level = { customerTypes: { normal: 1, vip: 1 } };
    // rng bajo cae en el primero, rng alto en el segundo
    expect(pickCustomerType(level, () => 0).id).toBe('normal');
    expect(pickCustomerType(level, () => 0.99).id).toBe('vip');
  });

  it('ignores unknown type names in level data', () => {
    const level = { customerTypes: { normal: 1, inventado: 5 } };
    for (let i = 0; i < 20; i++) {
      expect(CUSTOMER_TYPES[pickCustomerType(level).id]).toBeDefined();
    }
  });
});

describe('equilibrio de los tipos', () => {
  it('makes the VIP pay much more but wait much less', () => {
    const vip = CUSTOMER_TYPES.vip;
    expect(vip.payMultiplier).toBeGreaterThan(1);
    expect(vip.patienceMultiplier).toBeLessThan(1);
  });

  it('gives the group more dishes and more patience to compensate', () => {
    const grupo = CUSTOMER_TYPES.grupo;
    expect(grupo.extraDishes).toBeGreaterThan(0);
    expect(grupo.patienceMultiplier).toBeGreaterThan(1);
  });

  it('leaves the normal customer as the untouched baseline', () => {
    const n = CUSTOMER_TYPES.normal;
    expect(n.payMultiplier).toBe(1);
    expect(n.patienceMultiplier).toBe(1);
    expect(n.extraDishes).toBe(0);
  });
});

describe('progresión por nivel', () => {
  it('keeps the first levels free of special customers', () => {
    expect(LEVELS[0].customerTypes).toEqual({ normal: 1 });
    expect(LEVELS[1].customerTypes).toEqual({ normal: 1 });
  });

  it('introduces special customers later on', () => {
    const ultimo = LEVELS.at(-1).customerTypes;
    expect(Object.keys(ultimo).length).toBeGreaterThan(1);
  });

  it('only references customer types that exist', () => {
    for (const level of LEVELS) {
      for (const id of Object.keys(level.customerTypes || {})) {
        expect(CUSTOMER_TYPES[id], `${level.id} usa el tipo "${id}" que no existe`).toBeDefined();
      }
    }
  });
});

describe('patienceForOrder', () => {
  it('scales with the number of dishes, because they cook one after another', () => {
    expect(patienceForOrder(10000, 1, CUSTOMER_TYPES.normal)).toBe(10000);
    expect(patienceForOrder(10000, 3, CUSTOMER_TYPES.normal)).toBe(30000);
  });

  it('applies the type multiplier on top', () => {
    expect(patienceForOrder(10000, 1, CUSTOMER_TYPES.vip)).toBe(7000);
  });

  it('works without a type', () => {
    expect(patienceForOrder(10000, 2, null)).toBe(20000);
  });
});

// Esta prueba existe porque una versión anterior repartía paciencia de forma
// que el VIP de los últimos niveles era IMPOSIBLE de servir (margen negativo)
// aun jugando perfecto. Recalcula el peor caso de cada nivel y tipo.
describe('balance: todo pedido debe ser servible', () => {
  const prepTime = (recipe) => recipe.steps.reduce((total, s) => total + s.duration, 0);

  const worstCases = () => {
    const casos = [];
    for (const level of LEVELS) {
      const peorPlatillo = Math.max(...level.recipeIds.map((id) => prepTime(RECIPES[id])));
      for (const [typeId, weight] of Object.entries(level.customerTypes || { normal: 1 })) {
        if (!weight) continue;
        const type = CUSTOMER_TYPES[typeId];
        const dishes = Math.min(Math.max(...level.orderSizes) + type.extraDishes, type.maxOrderSize);
        casos.push({
          nombre: `${level.id}/${typeId}`,
          prep: peorPlatillo * dishes,
          patience: patienceForOrder(level.patience, dishes, type),
        });
      }
    }
    return casos;
  };

  it('leaves enough patience to actually cook the worst-case order', () => {
    for (const c of worstCases()) {
      expect(c.patience, `${c.nombre} es imposible: ${c.patience}ms para ${c.prep}ms de trabajo`)
        .toBeGreaterThan(c.prep);
    }
  });

  it('leaves at least a couple of seconds of human slack', () => {
    for (const c of worstCases()) {
      expect(c.patience - c.prep, `${c.nombre} deja muy poco margen`).toBeGreaterThanOrEqual(2000);
    }
  });
});

describe('isRushHour', () => {
  const duration = 100000;
  const atElapsed = (pct) => isRushHour(duration * (1 - pct), duration);

  it('is quiet at the start and near the end', () => {
    expect(atElapsed(0)).toBe(false);
    expect(atElapsed(0.2)).toBe(false);
    expect(atElapsed(0.9)).toBe(false);
  });

  it('kicks in around the middle of the run', () => {
    expect(atElapsed(0.5)).toBe(true);
    expect(atElapsed(0.65)).toBe(true);
  });

  it('is safe when the level has no duration', () => {
    expect(isRushHour(1000, 0)).toBe(false);
    expect(isRushHour(1000, undefined)).toBe(false);
  });

  it('makes customers arrive more often, never less', () => {
    expect(RUSH_SPAWN_FACTOR).toBeGreaterThan(0);
    expect(RUSH_SPAWN_FACTOR).toBeLessThan(1);
  });
});
