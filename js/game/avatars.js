// Caras de clientes. Se elige una al azar por cliente para que la fila no
// se vea toda igual.
export const CUSTOMER_FACES = [
  '🧑', '👩', '👨', '🧓', '👵', '👦', '👧', '🧔',
  '👩‍🦰', '👨‍🦱', '👩‍🦳', '🧑‍🎤', '👩‍🎓', '👨‍💼', '🧑‍🚀', '👮',
];

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
