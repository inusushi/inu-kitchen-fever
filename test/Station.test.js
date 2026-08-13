import { describe, it, expect } from 'vitest';
import { Station } from '../js/game/Station.js';
import { Plate } from '../js/game/Plate.js';

const recipe = {
  id: 'test-recipe',
  steps: [
    { station: 'cook', duration: 1000 },
    { station: 'plate', duration: 500 },
  ],
};

const chopStation = () => new Station('chop', 'Preparar', '🔪', { burns: false });
const cookStation = (grace = 4500) => new Station('cook', 'Freír', '🔥', { burns: true, burnGraceMs: grace });

describe('Station que no quema (cortar, emplatar)', () => {
  it('is idle until started', () => {
    const s = chopStation();
    expect(s.busy).toBe(false);
    expect(s.progressRatio()).toBe(0);
  });

  it('advances the plate on its own when the time is up', () => {
    const s = chopStation();
    const plate = new Plate(recipe);
    s.start(plate, 1000);

    expect(s.update(400)).toBeNull();
    expect(s.busy).toBe(true);

    const ev = s.update(700);
    expect(ev.type).toBe('advanced');
    expect(ev.plate).toBe(plate);
    expect(plate.stepIndex).toBe(1);
    expect(s.busy).toBe(false);
  });

  it('reports progress ratio while working', () => {
    const s = chopStation();
    s.start(new Plate(recipe), 1000);
    s.update(250);
    expect(s.progressRatio()).toBeCloseTo(0.25);
  });
});

describe('Station de fuego', () => {
  it('leaves the dish waiting for pickup instead of advancing it', () => {
    const s = cookStation();
    const plate = new Plate(recipe);
    s.start(plate, 1000);

    const ev = s.update(1000);
    expect(ev.type).toBe('cooked');
    expect(s.waitingPickup).toBe(true);
    expect(s.busy).toBe(true);
    // No avanzó: sigue en el mismo paso hasta que lo recojan.
    expect(plate.stepIndex).toBe(0);
  });

  it('advances the plate when collected in time', () => {
    const s = cookStation();
    const plate = new Plate(recipe);
    s.start(plate, 1000);
    s.update(1000);
    s.update(2000); // dentro del margen

    const collected = s.collect();
    expect(collected).toBe(plate);
    expect(plate.stepIndex).toBe(1);
    expect(plate.burnt).toBeUndefined();
    expect(s.busy).toBe(false);
  });

  it('burns the dish when nobody collects it in time', () => {
    const s = cookStation(3000);
    const plate = new Plate(recipe);
    s.start(plate, 1000);
    s.update(1000);

    expect(s.update(2000)).toBeNull(); // todavía dentro del margen
    const ev = s.update(1500);
    expect(ev.type).toBe('burnt');
    expect(ev.plate).toBe(plate);
    expect(plate.burnt).toBe(true);
    expect(plate.stepIndex).toBe(0); // nunca avanzó
    expect(s.busy).toBe(false);
  });

  it('counts down the burn margin from 1 to 0', () => {
    const s = cookStation(4000);
    s.start(new Plate(recipe), 1000);
    s.update(1000);
    expect(s.burnRatio()).toBe(1);
    s.update(2000);
    expect(s.burnRatio()).toBeCloseTo(0.5);
  });

  it('reports no burn margin while it is still cooking', () => {
    const s = cookStation();
    s.start(new Plate(recipe), 1000);
    s.update(400);
    expect(s.burnRatio()).toBe(0);
    expect(s.waitingPickup).toBe(false);
  });

  it('cannot be collected before the dish is done', () => {
    const s = cookStation();
    s.start(new Plate(recipe), 1000);
    s.update(400);
    expect(s.collect()).toBeNull();
    expect(s.busy).toBe(true);
  });

  it('is free for a new dish after burning', () => {
    const s = cookStation(1000);
    s.start(new Plate(recipe), 500);
    s.update(500);
    s.update(1000);
    expect(s.busy).toBe(false);

    const next = new Plate(recipe);
    s.start(next, 500);
    expect(s.plate).toBe(next);
  });
});
