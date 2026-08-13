import { describe, it, expect } from 'vitest';
import { Station } from '../js/game/Station.js';
import { Plate } from '../js/game/Plate.js';

const recipe = {
  id: 'test-recipe',
  steps: [
    { station: 'chop', duration: 1000 },
    { station: 'plate', duration: 500 },
  ],
};

describe('Station', () => {
  it('is idle until started', () => {
    const station = new Station('chop', 'Preparar', '🔪');
    expect(station.busy).toBe(false);
    expect(station.progressRatio()).toBe(0);
  });

  it('advances the plate and frees itself once the duration elapses', () => {
    const station = new Station('chop', 'Preparar', '🔪');
    const plate = new Plate(recipe);
    station.start(plate, 1000);

    expect(station.update(400)).toBeNull();
    expect(station.busy).toBe(true);
    expect(plate.stepIndex).toBe(0);

    const finished = station.update(700);
    expect(finished).toBe(plate);
    expect(station.busy).toBe(false);
    expect(plate.stepIndex).toBe(1);
  });

  it('reports progress ratio while busy', () => {
    const station = new Station('chop', 'Preparar', '🔪');
    const plate = new Plate(recipe);
    station.start(plate, 1000);
    station.update(250);
    expect(station.progressRatio()).toBeCloseTo(0.25);
  });
});
