// Cada receta se prepara pasando por estaciones en orden.
// station: 'chop' | 'cook' | 'plate'
export const RECIPES = {
  sandwich: {
    id: 'sandwich', name: 'Sándwich', emoji: '🥪', price: 14,
    steps: [{ station: 'chop', duration: 1600 }, { station: 'plate', duration: 1200 }],
  },
  ensalada: {
    id: 'ensalada', name: 'Ensalada', emoji: '🥗', price: 12,
    steps: [{ station: 'chop', duration: 2000 }, { station: 'plate', duration: 900 }],
  },
  sushiRoll: {
    id: 'sushiRoll', name: 'Rollo de sushi', emoji: '🍣', price: 18,
    steps: [{ station: 'chop', duration: 1800 }, { station: 'plate', duration: 1400 }],
  },
  nigiri: {
    id: 'nigiri', name: 'Nigiri', emoji: '🍙', price: 15,
    steps: [{ station: 'chop', duration: 1400 }, { station: 'plate', duration: 1000 }],
  },
  ramen: {
    id: 'ramen', name: 'Ramen', emoji: '🍜', price: 22,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 1000 }],
  },
  pizza: {
    id: 'pizza', name: 'Pizza margarita', emoji: '🍕', price: 24,
    steps: [{ station: 'chop', duration: 1400 }, { station: 'cook', duration: 2800 }, { station: 'plate', duration: 900 }],
  },
  pasta: {
    id: 'pasta', name: 'Pasta boloñesa', emoji: '🍝', price: 20,
    steps: [{ station: 'cook', duration: 2600 }, { station: 'plate', duration: 1100 }],
  },
  cafe: {
    id: 'cafe', name: 'Café', emoji: '☕', price: 10,
    steps: [{ station: 'cook', duration: 1500 }, { station: 'plate', duration: 700 }],
  },
  clubSandwich: {
    id: 'clubSandwich', name: 'Club sándwich', emoji: '🥙', price: 20,
    steps: [{ station: 'chop', duration: 1600 }, { station: 'cook', duration: 1400 }, { station: 'plate', duration: 1000 }],
  },
  waffle: {
    id: 'waffle', name: 'Waffle', emoji: '🧇', price: 18,
    steps: [{ station: 'cook', duration: 2200 }, { station: 'plate', duration: 1000 }],
  },
  pastel: {
    id: 'pastel', name: 'Rebanada de pastel', emoji: '🍰', price: 20,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'plate', duration: 1200 }],
  },
  helado: {
    id: 'helado', name: 'Helado', emoji: '🍦', price: 16,
    steps: [{ station: 'plate', duration: 1400 }],
  },
  donut: {
    id: 'donut', name: 'Dona', emoji: '🍩', price: 14,
    steps: [{ station: 'cook', duration: 1800 }, { station: 'plate', duration: 800 }],
  },
  taco: {
    id: 'taco', name: 'Taco', emoji: '🌮', price: 16,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 1400 }, { station: 'plate', duration: 700 }],
  },
  quesadilla: {
    id: 'quesadilla', name: 'Quesadilla', emoji: '🫓', price: 18,
    steps: [{ station: 'chop', duration: 1100 }, { station: 'cook', duration: 1600 }, { station: 'plate', duration: 700 }],
  },
  elote: {
    id: 'elote', name: 'Elote', emoji: '🌽', price: 13,
    steps: [{ station: 'cook', duration: 1300 }, { station: 'plate', duration: 900 }],
  },
  hamburguesa: {
    id: 'hamburguesa', name: 'Hamburguesa', emoji: '🍔', price: 22,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 1800 }, { station: 'plate', duration: 700 }],
  },
  papas: {
    id: 'papas', name: 'Papas fritas', emoji: '🍟', price: 12,
    steps: [{ station: 'cook', duration: 1400 }, { station: 'plate', duration: 500 }],
  },
  hotdog: {
    id: 'hotdog', name: 'Hot dog', emoji: '🌭', price: 15,
    steps: [{ station: 'cook', duration: 1200 }, { station: 'plate', duration: 600 }],
  },
  risotto: {
    id: 'risotto', name: 'Risotto', emoji: '🍚', price: 30,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2000 }, { station: 'plate', duration: 900 }],
  },
  filete: {
    id: 'filete', name: 'Filete gourmet', emoji: '🥩', price: 34,
    steps: [{ station: 'chop', duration: 900 }, { station: 'cook', duration: 1900 }, { station: 'plate', duration: 900 }],
  },
  tartar: {
    id: 'tartar', name: 'Tartar de atún', emoji: '🍣', price: 28,
    steps: [{ station: 'chop', duration: 1400 }, { station: 'plate', duration: 900 }],
  },
};

export const STATION_TYPES = [
  { type: 'chop', name: 'Cortar', emoji: '🔪' },
  { type: 'cook', name: 'Cocinar', emoji: '🔥' },
  { type: 'plate', name: 'Emplatar', emoji: '🍽️' },
];
