import { todayKey } from './objectives.js';

// Recompensa por día de racha, tope en el día 7 (se repite de ahí en
// adelante para no volverse infinito ni sentirse injusto tras la primera semana).
const REWARD_BY_DAY = [30, 40, 55, 70, 90, 120, 160];

export function rewardForStreak(day) {
  const index = Math.min(day, REWARD_BY_DAY.length) - 1;
  return REWARD_BY_DAY[Math.max(0, index)];
}

function daysBetween(fromKey, toKey) {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  const from = Date.UTC(fy, fm - 1, fd);
  const to = Date.UTC(ty, tm - 1, td);
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

// Se llama una vez por sesión (al entrar al menú). Devuelve el estado
// actualizado y si hay que mostrar el aviso de "racha".
//
// - Mismo día que la última visita: no pasa nada, ya se contó hoy.
// - Día siguiente exacto: la racha sube y da recompensa.
// - Se saltó uno o más días: la racha se reinicia a 1, sin recompensa
//   (evita farmear entrando y saliendo para juntar bonos).
export function applyDailyStreak(streakState, dateKey = todayKey()) {
  const { lastDate, current } = streakState;

  if (lastDate === dateKey) {
    return { streak: streakState, rewarded: false, reward: 0, isNewDay: false };
  }

  const gap = lastDate ? daysBetween(lastDate, dateKey) : null;
  const continues = gap === 1;
  const day = continues ? current + 1 : 1;
  const reward = rewardForStreak(day);

  return {
    streak: { lastDate: dateKey, current: day },
    rewarded: true,
    reward,
    isNewDay: true,
  };
}
