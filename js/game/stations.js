import { STATION_TYPES } from '../data/recipes.js';

// Cuántas estaciones de cada tipo hay, según las mejoras compradas.
// Las estaciones duplicadas permiten trabajar dos platillos a la vez en el
// mismo paso (segundo cuchillo, segundo cocinero).
export function buildStationLayout(upgrades = {}) {
  const extra = {
    chop: upgrades.extraChop || 0,
    cook: upgrades.extraCook || 0,
    plate: 0,
  };

  const layout = [];
  for (const base of STATION_TYPES) {
    const count = 1 + (extra[base.type] || 0);
    for (let i = 0; i < count; i++) {
      layout.push({
        type: base.type,
        emoji: base.emoji,
        // Solo numeramos cuando hay más de una del mismo tipo.
        name: count > 1 ? `${base.name} ${i + 1}` : base.name,
        // Solo el fuego quema: cortar y emplatar no arruinan un platillo.
        burns: base.type === 'cook',
      });
    }
  }
  return layout;
}
