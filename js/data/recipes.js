// Menú real de Inu Sushi (Tlalnepantla) — ingredientes y precios tomados
// del Costeador Maestro (inu-cocina/js/datos/costeador.json) y de la web
// pública de Mushipan. "chop" = preparar/cortar, "cook" = freír o cocer al
// vapor, "plate" = armar y presentar.
export const RECIPES = {
  // --- Onigiri (bolas de arroz) ---
  onigiriSalmon: {
    id: 'onigiriSalmon', name: 'Onigiri Salmón', emoji: '🍙', price: 52,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'plate', duration: 1000 }],
  },
  onigiriCamaron: {
    id: 'onigiriCamaron', name: 'Onigiri Camarón', emoji: '🍙', price: 47,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'plate', duration: 1000 }],
  },
  onigiriGreenRoll: {
    id: 'onigiriGreenRoll', name: 'Onigiri Green Roll', emoji: '🥑', price: 42,
    steps: [{ station: 'chop', duration: 1100 }, { station: 'plate', duration: 900 }],
  },

  // --- Rollos frescos clásicos ---
  californiaRoll: {
    id: 'californiaRoll', name: 'California Roll', emoji: '🍣', price: 80,
    steps: [{ station: 'chop', duration: 1500 }, { station: 'plate', duration: 1300 }],
  },
  greenRoll: {
    id: 'greenRoll', name: 'Green Roll', emoji: '🥑', price: 72,
    steps: [{ station: 'chop', duration: 1400 }, { station: 'plate', duration: 1200 }],
  },
  camaronTradicional: {
    id: 'camaronTradicional', name: 'Camarón Tradicional', emoji: '🍤', price: 90,
    steps: [{ station: 'chop', duration: 1500 }, { station: 'plate', duration: 1300 }],
  },

  // --- Bento ---
  bentoCamaron: {
    id: 'bentoCamaron', name: 'Bento Camarón', emoji: '🍱', price: 120,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 2200 }, { station: 'plate', duration: 1000 }],
  },
  bentoPolloEmpanizado: {
    id: 'bentoPolloEmpanizado', name: 'Bento Pollo Empanizado', emoji: '🍱', price: 120,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 2300 }, { station: 'plate', duration: 1000 }],
  },
  bentoSalmonAhumado: {
    id: 'bentoSalmonAhumado', name: 'Bento Salmón Ahumado', emoji: '🍱', price: 140,
    steps: [{ station: 'chop', duration: 1300 }, { station: 'cook', duration: 2300 }, { station: 'plate', duration: 1100 }],
  },

  // --- Banderillas (sushi empanizado y frito en palo, estilo corn dog japomexa) ---
  banderillaCamaronAguacate: {
    id: 'banderillaCamaronAguacate', name: 'Banderilla Camarón Aguacate', emoji: '🍢', price: 100,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 700 }],
  },
  banderillaMarYTierra: {
    id: 'banderillaMarYTierra', name: 'Banderilla Mar y Tierra', emoji: '🍢', price: 120,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2500 }, { station: 'plate', duration: 700 }],
  },
  banderillaDobleQueso: {
    id: 'banderillaDobleQueso', name: 'Banderilla Doble Queso', emoji: '🍢', price: 100,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2300 }, { station: 'plate', duration: 700 }],
  },

  // --- Rollos empanizados ---
  rolloSuizo: {
    id: 'rolloSuizo', name: 'Rollo Suizo', emoji: '🍤', price: 105,
    steps: [{ station: 'chop', duration: 1300 }, { station: 'cook', duration: 2100 }, { station: 'plate', duration: 1100 }],
  },
  spicyTunaRoll: {
    id: 'spicyTunaRoll', name: 'Spicy Tuna Roll', emoji: '🌶️', price: 115,
    steps: [{ station: 'chop', duration: 1300 }, { station: 'cook', duration: 2200 }, { station: 'plate', duration: 1100 }],
  },
  rolloGobernador: {
    id: 'rolloGobernador', name: 'Rollo Gobernador', emoji: '🍤', price: 115,
    steps: [{ station: 'chop', duration: 1300 }, { station: 'cook', duration: 2200 }, { station: 'plate', duration: 1100 }],
  },

  // --- Rollos frescos premium ---
  rollitoPio: {
    id: 'rollitoPio', name: 'Rollito Pío', emoji: '🐔', price: 115,
    steps: [{ station: 'chop', duration: 1600 }, { station: 'plate', duration: 1300 }],
  },
  ichigoRoll: {
    id: 'ichigoRoll', name: 'Ichigo Roll', emoji: '🍣', price: 130,
    steps: [{ station: 'chop', duration: 1700 }, { station: 'plate', duration: 1400 }],
  },
  sakuraRoll: {
    id: 'sakuraRoll', name: 'Sakura Roll', emoji: '🌸', price: 140,
    steps: [{ station: 'chop', duration: 1800 }, { station: 'plate', duration: 1400 }],
  },

  // --- Rollos VIP ---
  musashiRoll: {
    id: 'musashiRoll', name: 'Musashi Roll', emoji: '👑', price: 130,
    steps: [
      { station: 'chop', duration: 1200 },
      { station: 'cook', duration: 1700 },
      { station: 'cook', duration: 1700 },
      { station: 'plate', duration: 1100 },
    ],
  },
  donKangrejo: {
    id: 'donKangrejo', name: 'Don Kangrejo', emoji: '🦀', price: 140,
    steps: [{ station: 'chop', duration: 1300 }, { station: 'cook', duration: 2300 }, { station: 'plate', duration: 1200 }],
  },

  // --- Mushipan (postres) ---
  mushipanChocolateAbuelita: {
    id: 'mushipanChocolateAbuelita', name: 'Mushipan Chocolate Abuelita', emoji: '🍫', price: 25,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 800 }],
  },
  mushipanFrutosRojos: {
    id: 'mushipanFrutosRojos', name: 'Mushipan Frutos Rojos', emoji: '🍓', price: 25,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 800 }],
  },
  mushipanPizzaPepperoni: {
    id: 'mushipanPizzaPepperoni', name: 'Mushipan Pizza Pepperoni', emoji: '🍕', price: 30,
    steps: [{ station: 'chop', duration: 1300 }, { station: 'cook', duration: 2500 }, { station: 'plate', duration: 800 }],
  },
};

export const STATION_TYPES = [
  { type: 'chop', name: 'Preparar', emoji: '🔪' },
  { type: 'cook', name: 'Freír / Vapor', emoji: '🔥' },
  { type: 'plate', name: 'Armar', emoji: '🍽️' },
];
