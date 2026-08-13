import { describe, it, expect } from 'vitest';
import { buildStationLayout } from '../js/game/stations.js';

describe('buildStationLayout', () => {
  it('gives one station of each type with no upgrades', () => {
    const layout = buildStationLayout({});
    expect(layout.map((s) => s.type)).toEqual(['chop', 'cook', 'plate']);
    expect(layout.map((s) => s.name)).toEqual(['Preparar', 'Freír / Vapor', 'Armar']);
  });

  it('adds a second chop station with the extraChop upgrade', () => {
    const layout = buildStationLayout({ extraChop: 1 });
    expect(layout.filter((s) => s.type === 'chop')).toHaveLength(2);
    expect(layout.filter((s) => s.type === 'cook')).toHaveLength(1);
  });

  it('adds a second cook station with the extraCook upgrade', () => {
    const layout = buildStationLayout({ extraCook: 1 });
    expect(layout.filter((s) => s.type === 'cook')).toHaveLength(2);
  });

  it('numbers stations only when a type is duplicated', () => {
    const layout = buildStationLayout({ extraChop: 1 });
    const chopNames = layout.filter((s) => s.type === 'chop').map((s) => s.name);
    expect(chopNames).toEqual(['Preparar 1', 'Preparar 2']);
    // El tipo que sigue con una sola estación no se numera.
    expect(layout.find((s) => s.type === 'plate').name).toBe('Armar');
  });

  it('stacks both upgrades at their max level', () => {
    const layout = buildStationLayout({ extraChop: 2, extraCook: 2 });
    expect(layout.filter((s) => s.type === 'chop')).toHaveLength(3);
    expect(layout.filter((s) => s.type === 'cook')).toHaveLength(3);
    expect(layout).toHaveLength(7);
  });

  it('never duplicates the plating station', () => {
    const layout = buildStationLayout({ extraChop: 2, extraCook: 2, slot: 2 });
    expect(layout.filter((s) => s.type === 'plate')).toHaveLength(1);
  });
});
