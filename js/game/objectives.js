// Objetivos extra de cada nivel: se cumplen con lo que ya se mide al jugar
// (monedas, platos servidos, clientes perdidos, mejor combo).
export const LEVEL_OBJECTIVES = [
  { id: 'sinPerder', label: 'Termina sin perder ni un cliente', check: (r) => r.left === 0 },
  { id: 'combo5', label: 'Encadena 5 servicios seguidos', check: (r) => r.bestCombo >= 5 },
  { id: 'servir10', label: 'Sirve 10 platillos', check: (r) => r.served >= 10 },
];

export function evaluateObjectives(result) {
  return LEVEL_OBJECTIVES.map((o) => ({ id: o.id, label: o.label, done: o.check(result) }));
}

// --- Desafío diario ---
// El reto del día sale de la fecha, así que es igual para todos ese día
// y cambia solo al cambiar el día. Sin servidor, sin aleatoriedad guardada.
export const DAILY_CHALLENGES = [
  { id: 'servir15', label: 'Sirve 15 platillos hoy', goal: 15, track: 'served', reward: 150 },
  { id: 'combo8', label: 'Logra un combo de 8', goal: 8, track: 'bestCombo', reward: 150 },
  { id: 'ganar400', label: 'Gana 400 monedas en una partida', goal: 400, track: 'coinsEarned', reward: 200 },
  { id: 'limpio', label: 'Termina un nivel sin perder clientes', goal: 1, track: 'perfectRuns', reward: 200 },
];

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dailyChallengeFor(dateKey) {
  // Suma de los dígitos de la fecha: estable, sin depender de zona horaria.
  const seed = dateKey.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return DAILY_CHALLENGES[seed % DAILY_CHALLENGES.length];
}

// Cuánto aporta una partida al reto del día.
export function dailyProgressFrom(challenge, result) {
  if (challenge.track === 'perfectRuns') return result.left === 0 ? 1 : 0;
  if (challenge.track === 'bestCombo') return result.bestCombo;
  return result[challenge.track] || 0;
}

// Los retos acumulativos suman entre partidas; los de récord se quedan con
// el mejor intento (encadenar 8 tiene que pasar en una sola partida).
export function mergeDailyProgress(challenge, previous, contribution) {
  if (challenge.track === 'bestCombo' || challenge.track === 'coinsEarned') {
    return Math.max(previous, contribution);
  }
  return previous + contribution;
}
