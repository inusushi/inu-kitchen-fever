export const LEVELS = [
  {
    id: 'basic', name: 'Cocina Básica', emoji: '🍳',
    recipeIds: ['sandwich', 'ensalada'],
    duration: 75000, spawnInterval: [3400, 5000], patience: 14000,
    maxCustomers: 4, starGoals: [40, 70, 100],
  },
  {
    id: 'sushi', name: 'Sushi Bar', emoji: '🍣',
    recipeIds: ['sushiRoll', 'nigiri', 'ramen'],
    duration: 85000, spawnInterval: [3200, 4600], patience: 13000,
    maxCustomers: 4, starGoals: [65, 105, 150],
  },
  {
    id: 'pizza', name: 'Pizzería', emoji: '🍕',
    recipeIds: ['pizza', 'pasta'],
    duration: 90000, spawnInterval: [3000, 4400], patience: 13000,
    maxCustomers: 5, starGoals: [75, 125, 175],
  },
  {
    id: 'cafe', name: 'Cafetería', emoji: '☕',
    recipeIds: ['cafe', 'clubSandwich', 'waffle'],
    duration: 95000, spawnInterval: [2800, 4200], patience: 12000,
    maxCustomers: 5, starGoals: [95, 155, 215],
  },
  {
    id: 'postres', name: 'Postres', emoji: '🍰',
    recipeIds: ['pastel', 'helado', 'donut'],
    duration: 100000, spawnInterval: [2600, 4000], patience: 11000,
    maxCustomers: 5, starGoals: [115, 185, 260],
  },
  {
    id: 'taqueria', name: 'Taquería', emoji: '🌮',
    recipeIds: ['taco', 'quesadilla', 'elote'],
    duration: 100000, spawnInterval: [2400, 3600], patience: 10500,
    maxCustomers: 6, starGoals: [130, 210, 300],
  },
  {
    id: 'comidaRapida', name: 'Comida Rápida', emoji: '🍔',
    recipeIds: ['hamburguesa', 'papas', 'hotdog'],
    duration: 105000, spawnInterval: [2200, 3400], patience: 10000,
    maxCustomers: 6, starGoals: [150, 240, 340],
  },
  {
    id: 'altaCocina', name: 'Alta Cocina', emoji: '🍽️',
    recipeIds: ['risotto', 'filete', 'tartar'],
    duration: 110000, spawnInterval: [2000, 3200], patience: 9500,
    maxCustomers: 6, starGoals: [180, 280, 400],
  },
];
