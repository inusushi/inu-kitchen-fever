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
  onigiriCangrejo: {
    id: 'onigiriCangrejo', name: 'Onigiri Cangrejo', emoji: '🍙', price: 42,
    steps: [{ station: 'chop', duration: 1100 }, { station: 'plate', duration: 900 }],
  },
  onigiriPollo: {
    id: 'onigiriPollo', name: 'Onigiri Pollo', emoji: '🍙', price: 42,
    steps: [{ station: 'chop', duration: 1100 }, { station: 'plate', duration: 900 }],
  },
  onigiriLomoAtun: {
    id: 'onigiriLomoAtun', name: 'Onigiri Lomo de Atún', emoji: '🍙', price: 47,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'plate', duration: 1000 }],
  },
  onigiriSalmonAhumado: {
    id: 'onigiriSalmonAhumado', name: 'Onigiri Salmón Ahumado', emoji: '🍙', price: 60,
    steps: [{ station: 'chop', duration: 1300 }, { station: 'plate', duration: 1000 }],
  },
  onigiriFrutal: {
    id: 'onigiriFrutal', name: 'Onigiri Frutal', emoji: '🥭', price: 42,
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
  furutsuRoll: {
    id: 'furutsuRoll', name: 'Furutsu Roll', emoji: '🍓', price: 72,
    steps: [{ station: 'chop', duration: 1500 }, { station: 'plate', duration: 1300 }],
  },
  veggieRoll: {
    id: 'veggieRoll', name: 'Veggie', emoji: '🥦', price: 80,
    steps: [{ station: 'chop', duration: 1500 }, { station: 'plate', duration: 1300 }],
  },
  salmonTradicional: {
    id: 'salmonTradicional', name: 'Salmón Tradicional', emoji: '🍣', price: 100,
    steps: [{ station: 'chop', duration: 1500 }, { station: 'plate', duration: 1300 }],
  },
  atunTradicional: {
    id: 'atunTradicional', name: 'Atún Tradicional', emoji: '🍣', price: 90,
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
  bentoGreenRoll: {
    id: 'bentoGreenRoll', name: 'Bento Green Roll', emoji: '🍱', price: 110,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 2100 }, { station: 'plate', duration: 1000 }],
  },
  bentoCangrejo: {
    id: 'bentoCangrejo', name: 'Bento Cangrejo', emoji: '🍱', price: 110,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 2100 }, { station: 'plate', duration: 1000 }],
  },
  bentoLomoAtun: {
    id: 'bentoLomoAtun', name: 'Bento Lomo de Atún', emoji: '🍱', price: 130,
    steps: [{ station: 'chop', duration: 1300 }, { station: 'cook', duration: 2200 }, { station: 'plate', duration: 1000 }],
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
  banderillaSurimiClasico: {
    id: 'banderillaSurimiClasico', name: 'Banderilla Surimi Clásico', emoji: '🍢', price: 90,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2300 }, { station: 'plate', duration: 700 }],
  },
  banderillaSurimiPlatanero: {
    id: 'banderillaSurimiPlatanero', name: 'Banderilla Surimi Platanero', emoji: '🍢', price: 90,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2300 }, { station: 'plate', duration: 700 }],
  },
  banderillaTropical: {
    id: 'banderillaTropical', name: 'Banderilla Tropical', emoji: '🍢', price: 110,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 700 }],
  },
  banderillaCamaronTocino: {
    id: 'banderillaCamaronTocino', name: 'Banderilla Camarón Tocino', emoji: '🍢', price: 110,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 700 }],
  },
  banderillaPolloManchego: {
    id: 'banderillaPolloManchego', name: 'Banderilla Pollo Manchego', emoji: '🍢', price: 90,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2300 }, { station: 'plate', duration: 700 }],
  },
  banderillaBisteckClasico: {
    id: 'banderillaBisteckClasico', name: 'Banderilla Bisteck Clásico', emoji: '🍢', price: 100,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 700 }],
  },
  banderillaArracheraPremium: {
    id: 'banderillaArracheraPremium', name: 'Banderilla Arrachera Premium', emoji: '🍢', price: 110,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 700 }],
  },
  banderillaFrutal: {
    id: 'banderillaFrutal', name: 'Banderilla Frutal', emoji: '🍢', price: 85,
    steps: [{ station: 'chop', duration: 1000 }, { station: 'cook', duration: 2200 }, { station: 'plate', duration: 700 }],
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
  mushipanChocobanana: {
    id: 'mushipanChocobanana', name: 'Mushipan Chocobanana', emoji: '🍌', price: 25,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 800 }],
  },
  mushipanNutella: {
    id: 'mushipanNutella', name: 'Mushipan Nutella', emoji: '🍫', price: 25,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 800 }],
  },
  mushipanOreo: {
    id: 'mushipanOreo', name: 'Mushipan Galleta Oreo', emoji: '🍪', price: 25,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 800 }],
  },
  mushipanPayLimon: {
    id: 'mushipanPayLimon', name: 'Mushipan Pay de Limón', emoji: '🍋', price: 25,
    steps: [{ station: 'chop', duration: 1200 }, { station: 'cook', duration: 2400 }, { station: 'plate', duration: 800 }],
  },
  mushipanCerdoTeriyaki: {
    id: 'mushipanCerdoTeriyaki', name: 'Mushipan Cerdo Teriyaki', emoji: '🍖', price: 30,
    steps: [{ station: 'chop', duration: 1300 }, { station: 'cook', duration: 2500 }, { station: 'plate', duration: 800 }],
  },
};

export const STATION_TYPES = [
  { type: 'chop', name: 'Preparar', emoji: '🔪' },
  { type: 'cook', name: 'Freír / Vapor', emoji: '🔥' },
  { type: 'plate', name: 'Armar', emoji: '🍽️' },
];
