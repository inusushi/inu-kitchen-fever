// Decoración del local: cosmética + un bonus fijo de propina por platillo
// servido (aparte del % de la mejora "Buena propina"). Solo una puede estar
// equipada a la vez, como elegir el tema de la cocina.
export const DECORATIONS = [
  {
    id: 'none', name: 'Cocina básica', emoji: '🍳',
    desc: 'Sin decoración todavía', cost: 0, tipBonus: 0, theme: null,
  },
  {
    id: 'lanterns', name: 'Linternas japonesas', emoji: '🏮',
    desc: '+3 monedas fijas por platillo servido', cost: 150, tipBonus: 3, theme: 'theme-lanterns',
  },
  {
    id: 'sakura', name: 'Ramas de sakura', emoji: '🌸',
    desc: '+5 monedas fijas por platillo servido', cost: 280, tipBonus: 5, theme: 'theme-sakura',
  },
  {
    id: 'neon', name: 'Letrero de neón', emoji: '💫',
    desc: '+8 monedas fijas por platillo servido', cost: 450, tipBonus: 8, theme: 'theme-neon',
  },
  {
    id: 'koi', name: 'Estanque de koi', emoji: '🐟',
    desc: '+12 monedas fijas por platillo servido', cost: 650, tipBonus: 12, theme: 'theme-koi',
  },
];

export function decorationById(id) {
  return DECORATIONS.find((d) => d.id === id) || DECORATIONS[0];
}
