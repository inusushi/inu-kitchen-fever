// Aplica las clases de accesibilidad al documento según lo guardado. Se
// llama al arrancar la app y cada vez que se cambia una opción.
export function applyA11ySettings(settings) {
  document.documentElement.classList.toggle('colorblind', !!settings.colorblind);
  document.documentElement.classList.toggle('large-text', !!settings.largeText);
}
