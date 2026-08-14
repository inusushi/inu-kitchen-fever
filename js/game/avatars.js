// Caras de clientes, cada una con su propio color de atuendo — así cada
// tipo de cliente se distingue de un vistazo (diseño y color, ya que no hay
// arte propio) y no todos los que llegan se ven iguales.
export const CUSTOMERS = [
  { face: '🧑', outfit: '#5b8def' },
  { face: '👩', outfit: '#ff7fb0' },
  { face: '👨', outfit: '#4dc9a8' },
  { face: '🧓', outfit: '#c9a15a' },
  { face: '👵', outfit: '#b48cff' },
  { face: '👦', outfit: '#5bc0ff' },
  { face: '👧', outfit: '#ff9fd0' },
  { face: '🧔', outfit: '#7c8cff' },
  { face: '👩‍🦰', outfit: '#ff8a3d' },
  { face: '👨‍🦱', outfit: '#3ec6ff' },
  { face: '👩‍🦳', outfit: '#e0a3ff' },
  { face: '🧑‍🎤', outfit: '#ff5a8a' },
  { face: '👩‍🎓', outfit: '#4dd67a' },
  { face: '👨‍💼', outfit: '#8c9bb5' },
  { face: '🧑‍🚀', outfit: '#5cd3d3' },
  { face: '👮', outfit: '#5577cc' },
];

export const CUSTOMER_FACES = CUSTOMERS.map((c) => c.face);

export function randomCustomerDesign(rng = Math.random) {
  return CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)];
}

// La cara cambia según la paciencia: contento al llegar, enojado al final.
// Se lee de arriba abajo y gana el primero cuyo umbral se cumple.
const MOODS = [
  { min: 0.66, emoji: '😃', label: 'contento' },
  { min: 0.4, emoji: '🙂', label: 'esperando' },
  { min: 0.2, emoji: '😟', label: 'impaciente' },
  { min: 0, emoji: '😠', label: 'enojado' },
];

export function moodFor(patienceRatio) {
  return MOODS.find((m) => patienceRatio >= m.min) || MOODS[MOODS.length - 1];
}

// Cocineros que se muestran en cada estación mientras trabajan.
export const COOK_AVATARS = {
  chop: '🧑‍🍳',
  cook: '👨‍🍳',
  plate: '👩‍🍳',
};

export function cookFor(stationType) {
  return COOK_AVATARS[stationType] || '🧑‍🍳';
}
