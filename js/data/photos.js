// Fotos reales de los platillos de Inu Sushi (las mismas de la carta).
// Los platillos sin foto siguen mostrando su emoji, así que agregar una foto
// nueva es solo poner el archivo en public/fotos y añadir la línea aquí.
export const DISH_PHOTOS = {
  // Onigiri
  onigiriSalmon: 'onigiri-salmon.webp',
  onigiriCamaron: 'onigiri-camaron.webp',
  onigiriGreenRoll: 'onigiri-green-roll.webp',
  onigiriCangrejo: 'onigiri-cangrejo.webp',
  onigiriPollo: 'onigiri-pollo.webp',
  onigiriLomoAtun: 'onigiri-lomo-atun.webp',
  onigiriFrutal: 'onigiri-frutal.webp',

  // Rollos frescos
  californiaRoll: 'california-roll.webp',
  greenRoll: 'green-roll.webp',
  furutsuRoll: 'furutsu-roll.webp',
  veggieRoll: 'veggie.webp',

  // Bento
  bentoCamaron: 'bento-camaron.webp',
  bentoSalmonAhumado: 'bento-salmon-ahumado.webp',
  bentoLomoAtun: 'bento-lomo-de-atun.webp',
  bentoGreenRoll: 'bento-green-frutal-cangrejo-pollo.webp',
  bentoCangrejo: 'bento-green-frutal-cangrejo-pollo.webp',

  // Rollos empanizados
  rolloSuizo: 'rollo-suizo.webp',
  spicyTunaRoll: 'spicy-tuna-roll.webp',
  rolloGobernador: 'rollo-gobernador.webp',

  // Rollos premium
  rollitoPio: 'rollito-pio.webp',
  ichigoRoll: 'ichigo-roll.webp',
  sakuraRoll: 'sakura-roll.webp',

  // Rollos VIP
  musashiRoll: 'musashi-roll.webp',
  donKangrejo: 'don-kangrejo.webp',

  // Mushipan
  mushipanChocolateAbuelita: 'mushi-abuelita.webp',
  mushipanFrutosRojos: 'mushi-frutos-rojos.webp',
  mushipanPizzaPepperoni: 'mushi-pepperoni.webp',
  mushipanChocobanana: 'mushi-chocobanana.webp',
  mushipanNutella: 'mushi-nutella.webp',
  mushipanOreo: 'mushi-oreo.webp',
  mushipanPayLimon: 'mushi-pay-limon.webp',
  mushipanCerdoTeriyaki: 'mushi-teriyaki.webp',
};

// Fondo por nivel. Los que no tienen uno propio se quedan sin foto de fondo.
export const LEVEL_BACKGROUNDS = {
  onigiri: 'fondo-onigiri.webp',
  rollosFrescos: 'fondo-rollos.webp',
  bento: 'fondo-bento.webp',
  rollosEmpanizados: 'fondo-rollos.webp',
  rollosPremium: 'fondo-rollos.webp',
  rollosVip: 'fondo-rollos.webp',
  mushipan: 'fondo-mushi.webp',
};

const BASE = 'fotos/';

export function photoFor(recipeId) {
  const file = DISH_PHOTOS[recipeId];
  return file ? BASE + file : null;
}

export function backgroundFor(levelId) {
  const file = LEVEL_BACKGROUNDS[levelId];
  return file ? BASE + file : null;
}
