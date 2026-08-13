// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { DECORATIONS, decorationById } from '../js/data/decorations.js';
import { serveReward } from '../js/game/interaction.js';
import { SaveManager } from '../js/core/SaveManager.js';

describe('decorationById', () => {
  it('finds a real decoration by id', () => {
    expect(decorationById('sakura').name).toBe('Ramas de sakura');
  });

  it('falls back to the free default for an unknown id', () => {
    expect(decorationById('inventada').id).toBe('none');
    expect(decorationById(undefined).id).toBe('none');
  });

  it('has the free option cost nothing and give no bonus', () => {
    const free = decorationById('none');
    expect(free.cost).toBe(0);
    expect(free.tipBonus).toBe(0);
  });

  it('prices and bonuses grow together, so nothing is a strictly worse buy', () => {
    const paid = DECORATIONS.filter((d) => d.id !== 'none');
    for (let i = 1; i < paid.length; i++) {
      expect(paid[i].cost).toBeGreaterThan(paid[i - 1].cost);
      expect(paid[i].tipBonus).toBeGreaterThan(paid[i - 1].tipBonus);
    }
  });
});

describe('serveReward con bono de decoración', () => {
  it('adds the flat bonus on top of everything else', () => {
    const sinDecor = serveReward(100, 0.2, 1, 0, 0);
    const conDecor = serveReward(100, 0.2, 1, 0, 8);
    expect(conDecor - sinDecor).toBe(8);
  });

  it('defaults to zero bonus when omitted', () => {
    expect(serveReward(100, 0.2, 1, 0)).toBe(serveReward(100, 0.2, 1, 0, 0));
  });
});

describe('SaveManager — decoraciones', () => {
  let save;
  beforeEach(() => {
    localStorage.clear();
    save = new SaveManager();
  });

  it('starts owning and wearing only the free option', () => {
    expect(save.ownsDecoration('none')).toBe(true);
    expect(save.state.decorations.equipped).toBe('none');
  });

  it('cannot equip something not owned', () => {
    expect(save.equipDecoration('sakura')).toBe(false);
    expect(save.state.decorations.equipped).toBe('none');
  });

  it('buys, then can equip, and spends the coins', () => {
    save.addCoins(1000);
    expect(save.buyDecoration('sakura', 280)).toBe(true);
    expect(save.state.coins).toBe(720);
    expect(save.equipDecoration('sakura')).toBe(true);
    expect(save.state.decorations.equipped).toBe('sakura');
  });

  it('refuses to buy without enough coins', () => {
    save.state.coins = 10;
    expect(save.buyDecoration('sakura', 280)).toBe(false);
    expect(save.ownsDecoration('sakura')).toBe(false);
  });

  it('refuses to buy the same decoration twice', () => {
    save.addCoins(2000);
    save.buyDecoration('sakura', 280);
    const coinsAfterFirst = save.state.coins;
    expect(save.buyDecoration('sakura', 280)).toBe(false);
    expect(save.state.coins).toBe(coinsAfterFirst);
  });

  it('persists the equipped decoration across reloads', () => {
    save.addCoins(1000);
    save.buyDecoration('neon', 450);
    save.equipDecoration('neon');
    const reloaded = new SaveManager();
    expect(reloaded.state.decorations.equipped).toBe('neon');
    expect(reloaded.ownsDecoration('neon')).toBe(true);
  });
});
