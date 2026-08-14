// Qué equipo se ve en cada estación, según el nivel. La estación de fuego
// cambia de vaporera a freidora o estufa dependiendo de lo que se cocine ahí
// realmente — así el vapor de Mushipan no se ve igual que freír un rollo.
const COOK_EQUIPMENT = {
  bento: { icon: '🍳', ambient: 'flame' },
  banderillas: { icon: '🍟', ambient: 'flame' },
  rollosEmpanizados: { icon: '🍤', ambient: 'flame' },
  rollosVip: { icon: '🍤', ambient: 'flame' },
  mushipan: { icon: '🫕', ambient: 'steam' },
};
const DEFAULT_COOK = { icon: '🔥', ambient: 'flame' };

const CHOP_EQUIPMENT = { icon: '🔪', ambient: 'chop' };
const PLATE_EQUIPMENT = { icon: '🍽️', ambient: 'plate' };

export function equipmentFor(levelId, stationType) {
  if (stationType === 'chop') return CHOP_EQUIPMENT;
  if (stationType === 'plate') return PLATE_EQUIPMENT;
  return COOK_EQUIPMENT[levelId] || DEFAULT_COOK;
}
