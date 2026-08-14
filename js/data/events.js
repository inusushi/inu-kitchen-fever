// Eventos de temporada: ligan una promoción real del negocio a un rango de
// fechas del juego. Vacío a propósito — las fechas y bonos los define Dany,
// nunca se inventan aquí. Para agregar uno:
//
// { id: 'dia-madres-2026', name: 'Día de las Madres', emoji: '💐',
//   start: '2026-05-08', end: '2026-05-10',
//   coinMultiplier: 1.5, message: 'Descuento especial en rollos frescos toda la semana' }
export const SEASONAL_EVENTS = [];

function toUTC(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

// El rango es inclusivo en ambos extremos, comparando solo por fecha
// (no por hora), para que "termina el 10" incluya todo el día 10.
export function activeEventFor(dateKey, events = SEASONAL_EVENTS) {
  const today = toUTC(dateKey);
  return events.find((ev) => today >= toUTC(ev.start) && today <= toUTC(ev.end)) || null;
}
