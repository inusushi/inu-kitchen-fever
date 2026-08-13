import { describe, it, expect } from 'vitest';
import { decideCustomerTap, serveReward } from '../js/game/interaction.js';

const taco = { id: 'taco', price: 100 };
const sushi = { id: 'sushi', price: 80 };

const waiting = (recipe) => ({ recipe, state: 'waiting' });
const empty = () => ({ plate: null });
const withPlate = (recipe, state) => ({ plate: { recipe, state } });

describe('decideCustomerTap', () => {
  it('ignores customers that already left or were served', () => {
    const customer = { recipe: taco, state: 'left' };
    expect(decideCustomerTap(customer, [empty()], [customer]).action).toBe('ignore');
  });

  it('starts the order in the first free table', () => {
    const customer = waiting(taco);
    const slots = [withPlate(sushi, 'prepping'), empty()];
    expect(decideCustomerTap(customer, slots, [customer])).toEqual({ action: 'start', slotIndex: 1 });
  });

  it('serves when a ready plate matches the order', () => {
    const customer = waiting(taco);
    const slots = [empty(), withPlate(taco, 'ready')];
    expect(decideCustomerTap(customer, slots, [customer])).toEqual({ action: 'serve', slotIndex: 1 });
  });

  it('prefers serving a ready plate over starting a new one', () => {
    const customer = waiting(taco);
    const slots = [empty(), withPlate(taco, 'ready')];
    expect(decideCustomerTap(customer, slots, [customer]).action).toBe('serve');
  });

  it('rejects when every table is busy', () => {
    const customer = waiting(taco);
    const slots = [withPlate(sushi, 'prepping'), withPlate(sushi, 'prepping')];
    expect(decideCustomerTap(customer, slots, [customer]).action).toBe('reject');
  });

  it('does not waste a table duplicating a dish already in progress', () => {
    const customer = waiting(taco);
    const slots = [withPlate(taco, 'prepping'), empty()];
    expect(decideCustomerTap(customer, slots, [customer]).action).toBe('reject');
  });

  it('does allow a second identical dish when two customers want it', () => {
    const a = waiting(taco);
    const b = waiting(taco);
    const slots = [withPlate(taco, 'prepping'), empty()];
    expect(decideCustomerTap(a, slots, [a, b])).toEqual({ action: 'start', slotIndex: 1 });
  });

  it('does not count customers who already left toward demand', () => {
    const a = waiting(taco);
    const gone = { recipe: taco, state: 'left' };
    const slots = [withPlate(taco, 'prepping'), empty()];
    expect(decideCustomerTap(a, slots, [a, gone]).action).toBe('reject');
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
