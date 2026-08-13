// Tipos de cliente. El normal es la base; los demás cambian cuánto pagan,
// cuánta paciencia traen y cuánto piden.
export const CUSTOMER_TYPES = {
  normal: {
    id: 'normal',
    payMultiplier: 1,
    patienceMultiplier: 1,
    extraDishes: 0,
    maxOrderSize: Infinity,
    badge: null,
    label: null,
  },
  vip: {
    id: 'vip',
    payMultiplier: 3,
    patienceMultiplier: 0.7, // paga mucho, pero no espera
    extraDishes: 0,
    // Un VIP siempre pide una sola cosa: es una persona con prisa, y con
    // pedido grande su poca paciencia lo volvía imposible de servir.
    maxOrderSize: 1,
    badge: '👑',
    label: 'VIP',
  },
  grupo: {
    id: 'grupo',
    payMultiplier: 1,
    patienceMultiplier: 1.15, // pide más, pero entiende que tarde
    extraDishes: 1,
    maxOrderSize: Infinity,
    badge: '👨‍👩‍👧',
    label: 'Grupo',
  },
  apurado: {
    id: 'apurado',
    payMultiplier: 1.6,
    patienceMultiplier: 0.7,
    extraDishes: 0,
    maxOrderSize: 2,
    badge: '⏱️',
    label: 'De prisa',
  },
};

// Cuánta paciencia trae un pedido. Los platillos se preparan en serie
// (una estación de cada tipo), así que cada platillo extra cuesta un ciclo
// completo: la paciencia sube en proporción, no un porcentaje menor.
export function patienceForOrder(basePatience, dishCount, type) {
  return basePatience * dishCount * (type ? type.patienceMultiplier : 1);
}

// Qué tipos pueden salir y con qué peso. Los primeros niveles son solo
// clientes normales; los especiales aparecen conforme sube la dificultad.
export function typeWeightsFor(level) {
  return level.customerTypes || { normal: 1 };
}

export function pickCustomerType(level, rng = Math.random) {
  const weights = typeWeightsFor(level);
  const entries = Object.entries(weights).filter(([id, w]) => w > 0 && CUSTOMER_TYPES[id]);
  if (!entries.length) return CUSTOMER_TYPES.normal;

  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = rng() * total;
  for (const [id, w] of entries) {
    roll -= w;
    if (roll < 0) return CUSTOMER_TYPES[id];
  }
  return CUSTOMER_TYPES[entries[entries.length - 1][0]];
}

// --- Oleadas de hora pico ---
// A media partida entra un tramo en el que los clientes llegan más seguido.
// Se calcula del tiempo restante para que sea igual en cada intento.
export function isRushHour(timeLeft, duration) {
  if (!duration) return false;
  const elapsed = 1 - timeLeft / duration;
  return elapsed >= 0.45 && elapsed <= 0.7;
}

export const RUSH_SPAWN_FACTOR = 0.6; // llegan ~40% más seguido
