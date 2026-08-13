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
];
