// Tutorial de primera vez. Los pasos avanzan con eventos que emite la cocina,
// no con temporizadores, para que nadie se quede atrás.
export const TUTORIAL_STEPS = [
  {
    id: 'pedir',
    text: '👆 Toca al cliente para tomar su pedido',
    target: 'customer',
    advanceOn: 'order-started',
  },
  {
    id: 'preparar',
    text: '👆 Toca las estaciones que brillan, en orden, hasta que el platillo esté listo',
    target: 'station',
    advanceOn: 'plate-ready',
  },
  {
    id: 'servir',
    text: '✅ ¡Ya está listo! Toca al cliente otra vez para servírselo',
    target: 'customer',
    advanceOn: 'served',
  },
  {
    id: 'fin',
    text: '🎉 ¡Eso es todo! Sirve a todos los que puedas antes de que se acabe el tiempo.',
    target: 'none',
    advanceOn: null,
  },
];

// Devuelve el índice del paso siguiente, o null si el evento no corresponde
// al paso actual (así un evento adelantado no salta pasos).
export function advanceTutorial(stepIndex, event) {
  const step = TUTORIAL_STEPS[stepIndex];
  if (!step || step.advanceOn !== event) return null;
  return stepIndex + 1;
}

export function isTutorialFinished(stepIndex) {
  return stepIndex >= TUTORIAL_STEPS.length - 1;
}

// Mientras el tutorial explica, el reloj y la paciencia no corren: el paso
// final ya no congela nada para que el jugador entre al ritmo real.
export function tutorialFreezesClock(stepIndex) {
  return stepIndex < TUTORIAL_STEPS.length - 1;
}
