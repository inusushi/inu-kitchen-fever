export const UPGRADES = [
  {
    id: 'speed', name: 'Manos rápidas', emoji: '⚡',
    desc: '-10% tiempo de preparación por nivel',
    baseCost: 50, costGrowth: 1.8, maxLevel: 3,
  },
  {
    id: 'slot', name: 'Mesa extra', emoji: '🍽️',
    desc: '+1 plato en preparación simultánea',
    baseCost: 90, costGrowth: 2.2, maxLevel: 2,
  },
  {
    id: 'patience', name: 'Clientes pacientes', emoji: '⏳',
    desc: '+20% paciencia de los clientes',
    baseCost: 60, costGrowth: 1.8, maxLevel: 3,
  },
  {
    id: 'tip', name: 'Buena propina', emoji: '💰',
    desc: '+10% monedas ganadas por plato',
    baseCost: 70, costGrowth: 1.8, maxLevel: 3,
  },
];

export function upgradeCost(upgrade, currentLevel) {
  return Math.round(upgrade.baseCost * Math.pow(upgrade.costGrowth, currentLevel));
}
