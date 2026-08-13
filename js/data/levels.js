export const LEVELS = [
  {
    id: 'onigiri', name: 'Onigiri', emoji: '🍙',
    recipeIds: [
      'onigiriSalmon', 'onigiriCamaron', 'onigiriGreenRoll',
      'onigiriCangrejo', 'onigiriPollo', 'onigiriLomoAtun',
      'onigiriSalmonAhumado', 'onigiriFrutal',
    ],
    duration: 75000, spawnInterval: [3400, 5000], patience: 14000,
    maxCustomers: 4, orderSizes: [1], customerTypes: { normal: 1 }, starGoals: [280, 460, 650],
  },
  {
    id: 'rollosFrescos', name: 'Rollos Frescos', emoji: '🍣',
    recipeIds: [
      'californiaRoll', 'greenRoll', 'camaronTradicional',
      'furutsuRoll', 'veggieRoll', 'salmonTradicional', 'atunTradicional',
    ],
    duration: 80000, spawnInterval: [3200, 4700], patience: 13500,
    maxCustomers: 4, orderSizes: [1], customerTypes: { normal: 1 }, starGoals: [480, 800, 1100],
  },
  {
    id: 'bento', name: 'Bento', emoji: '🍱',
    recipeIds: [
      'bentoCamaron', 'bentoPolloEmpanizado', 'bentoSalmonAhumado',
      'bentoGreenRoll', 'bentoCangrejo', 'bentoLomoAtun',
    ],
    duration: 88000, spawnInterval: [3000, 4400], patience: 13000,
    maxCustomers: 5, orderSizes: [1, 1, 2], customerTypes: { normal: 6, apurado: 1 }, starGoals: [750, 1250, 1750],
  },
  {
    id: 'banderillas', name: 'Banderillas', emoji: '🍢',
    recipeIds: [
      'banderillaCamaronAguacate', 'banderillaMarYTierra', 'banderillaDobleQueso',
      'banderillaSurimiClasico', 'banderillaSurimiPlatanero', 'banderillaTropical',
      'banderillaCamaronTocino', 'banderillaPolloManchego', 'banderillaBisteckClasico',
      'banderillaArracheraPremium', 'banderillaFrutal',
    ],
    duration: 92000, spawnInterval: [2800, 4200], patience: 12500,
    maxCustomers: 5, orderSizes: [1, 1, 2], customerTypes: { normal: 6, apurado: 2 }, starGoals: [640, 1050, 1500],
  },
  {
    id: 'rollosEmpanizados', name: 'Rollos Empanizados', emoji: '🍤',
    recipeIds: ['rolloSuizo', 'spicyTunaRoll', 'rolloGobernador'],
    duration: 95000, spawnInterval: [2600, 3900], patience: 12000,
    maxCustomers: 5, orderSizes: [1, 2], customerTypes: { normal: 5, apurado: 2, vip: 1 }, starGoals: [670, 1100, 1550],
  },
  {
    id: 'rollosPremium', name: 'Rollos Premium', emoji: '🌸',
    recipeIds: ['rollitoPio', 'ichigoRoll', 'sakuraRoll'],
    duration: 98000, spawnInterval: [2400, 3600], patience: 11500,
    maxCustomers: 5, orderSizes: [1, 2], customerTypes: { normal: 5, apurado: 2, vip: 2 }, starGoals: [770, 1250, 1800],
  },
  {
    id: 'rollosVip', name: 'Rollos VIP', emoji: '👑',
    recipeIds: ['musashiRoll', 'donKangrejo'],
    duration: 102000, spawnInterval: [2200, 3400], patience: 12000,
    maxCustomers: 6, orderSizes: [1, 2, 2], customerTypes: { normal: 4, apurado: 2, vip: 3, grupo: 1 }, starGoals: [800, 1300, 1850],
  },
  {
    id: 'mushipan', name: 'Mushipan', emoji: '🍞',
    recipeIds: [
      'mushipanChocolateAbuelita', 'mushipanFrutosRojos', 'mushipanPizzaPepperoni',
      'mushipanChocobanana', 'mushipanNutella', 'mushipanOreo',
      'mushipanPayLimon', 'mushipanCerdoTeriyaki',
    ],
    duration: 105000, spawnInterval: [2000, 3100], patience: 9500,
    maxCustomers: 6, orderSizes: [1, 2, 2, 3], customerTypes: { normal: 4, apurado: 2, vip: 2, grupo: 2 }, starGoals: [190, 310, 450],
  },
];
