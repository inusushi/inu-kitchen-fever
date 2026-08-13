import { describe, it, expect } from 'vitest';
import { decideCustomerTap, serveReward } from '../js/game/interaction.js';
import { Customer } from '../js/game/Customer.js';

const taco = { id: 'taco', name: 'Taco', price: 100 };
const sushi = { id: 'sushi', name: 'Sushi', price: 80 };

const waiting = (...recipes) => new Customer(recipes, 10000);
const empty = () => ({ plate: null });
const withPlate = (recipe, state) => ({ plate: { recipe, state } });

describe('decideCustomerTap — pedido de un platillo', () => {
  it('ignores customers that already left or were served', () => {
    const c = waiting(taco);
    c.state = 'left';
    expect(decideCustomerTap(c, [empty()], [c]).action).toBe('ignore');
  });

  it('starts the order in the first free table', () => {
    const c = waiting(taco);
    const slots = [withPlate(sushi, 'prepping'), empty()];
    const d = decideCustomerTap(c, slots, [c]);
    expect(d.action).toBe('start');
    expect(d.slotIndex).toBe(1);
    expect(d.recipe).toBe(taco);
  });

  it('serves when a ready plate matches the order', () => {
    const c = waiting(taco);
    const slots = [empty(), withPlate(taco, 'ready')];
    expect(decideCustomerTap(c, slots, [c])).toEqual({ action: 'serve', slotIndex: 1 });
  });

  it('rejects when every table is busy', () => {
    const c = waiting(taco);
    const slots = [withPlate(sushi, 'prepping'), withPlate(sushi, 'prepping')];
    expect(decideCustomerTap(c, slots, [c]).action).toBe('reject');
  });

  it('does not waste a table duplicating a dish already in progress', () => {
    const c = waiting(taco);
    const slots = [withPlate(taco, 'prepping'), empty()];
    expect(decideCustomerTap(c, slots, [c]).action).toBe('reject');
  });

  it('does allow a second identical dish when two customers want it', () => {
    const a = waiting(taco);
    const b = waiting(taco);
    const slots = [withPlate(taco, 'prepping'), empty()];
    expect(decideCustomerTap(a, slots, [a, b]).slotIndex).toBe(1);
  });

  it('does not count customers who already left toward demand', () => {
    const a = waiting(taco);
    const gone = waiting(taco);
    gone.state = 'left';
    const slots = [withPlate(taco, 'prepping'), empty()];
    expect(decideCustomerTap(a, slots, [a, gone]).action).toBe('reject');
  });
});

describe('decideCustomerTap — pedido de varios platillos', () => {
  it('starts the first pending dish of a two-item order', () => {
    const c = waiting(taco, sushi);
    const d = decideCustomerTap(c, [empty(), empty()], [c]);
    expect(d.action).toBe('start');
    expect(d.recipe).toBe(taco);
  });

  it('starts the second dish once the first is covered', () => {
    const c = waiting(taco, sushi);
    const slots = [withPlate(taco, 'prepping'), empty()];
    const d = decideCustomerTap(c, slots, [c]);
    expect(d.action).toBe('start');
    expect(d.recipe).toBe(sushi);
  });

  it('serves a ready dish even if the rest of the order is not started', () => {
    const c = waiting(taco, sushi);
    const slots = [withPlate(taco, 'ready'), empty()];
    expect(decideCustomerTap(c, slots, [c])).toEqual({ action: 'serve', slotIndex: 0 });
  });

  it('keeps working on what is still pending after a partial delivery', () => {
    const c = waiting(taco, sushi);
    c.deliver('taco');
    const d = decideCustomerTap(c, [empty(), empty()], [c]);
    expect(d.action).toBe('start');
    expect(d.recipe).toBe(sushi);
  });

  it('handles an order asking twice for the same dish', () => {
    const c = waiting(taco, taco);
    // Con uno en preparación todavía falta el otro, así que se permite el segundo.
    const slots = [withPlate(taco, 'prepping'), empty()];
    expect(decideCustomerTap(c, slots, [c]).action).toBe('start');
    // Con los dos cubiertos, ya no se desperdicia una mesa.
    const full = [withPlate(taco, 'prepping'), withPlate(taco, 'ready')];
    expect(decideCustomerTap(c, full, [c]).action).toBe('serve');
  });

  it('ignores a customer whose order is fully delivered', () => {
    const c = waiting(taco);
    c.deliver('taco');
    expect(decideCustomerTap(c, [empty()], [c]).action).toBe('ignore');
  });
});

describe('Customer con pedido múltiple', () => {
  it('reports completion only after every item is delivered', () => {
    const c = waiting(taco, sushi);
    expect(c.deliver('taco')).toBe(false);
    expect(c.isComplete()).toBe(false);
    expect(c.deliver('sushi')).toBe(true);
    expect(c.isComplete()).toBe(true);
  });

  it('needs two deliveries when the same dish was ordered twice', () => {
    const c = waiting(taco, taco);
    expect(c.deliver('taco')).toBe(false);
    expect(c.pendingRecipes()).toHaveLength(1);
    expect(c.deliver('taco')).toBe(true);
  });

  it('ignores a delivery of something that was not ordered', () => {
    const c = waiting(taco);
    expect(c.deliver('sushi')).toBe(false);
    expect(c.pendingRecipes()).toHaveLength(1);
  });

  it('sums the price of every item in the order', () => {
    expect(waiting(taco, sushi).totalPrice()).toBe(180);
  });
});

describe('serveReward', () => {
  it('pays the base price with no tip, no upgrade and no combo', () => {
    expect(serveReward(100, 0.2, 1, 0)).toBe(100);
  });

  it('adds a 25% tip when served with over half the patience left', () => {
    expect(serveReward(100, 0.8, 1, 0)).toBe(125);
  });

  it('applies the shop tip upgrade', () => {
    expect(serveReward(100, 0.2, 1.2, 0)).toBe(120);
  });

  it('grows with the combo but caps at 5 services', () => {
    expect(serveReward(100, 0.2, 1, 3)).toBe(115);
    expect(serveReward(100, 0.2, 1, 5)).toBe(125);
    expect(serveReward(100, 0.2, 1, 50)).toBe(125);
  });
});
