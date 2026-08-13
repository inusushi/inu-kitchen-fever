import { el, addTap } from '../utils/helpers.js';
import { MenuScene } from './MenuScene.js';

export class CloudScene {
  constructor(app) {
    this.app = app;
  }

  mount(root) {
    this.root = root;
    this.render();
  }

  render() {
    this.root.innerHTML = '';
    const wrap = el('div', 'screen cloud-screen');

    const header = el('div', 'top-bar');
    const backBtn = el('button', 'btn btn-icon', '←');
    addTap(backBtn, () => this.app.goTo(MenuScene));
    header.append(backBtn, el('h2', 'top-bar-title', '☁ Guardado en la nube'));
    wrap.append(header);

    if (!this.app.cloud.configured) {
      wrap.append(el('p', 'cloud-note', 'La nube todavía no está conectada en este juego. Tu progreso sigue guardado solo en este navegador.'));
      this.root.append(wrap);
      return;
    }

    const code = this.app.save.getOrCreateSyncCode();
    wrap.append(el('p', 'cloud-note', 'Este código guarda tu progreso en la nube. Cópialo y pégalo en otro dispositivo para continuar ahí.'));

    const codeBox = el('div', 'sync-code-box', code);
    const copyBtn = el('button', 'btn btn-secondary', '📋 Copiar código');
    addTap(copyBtn, async () => {
      await navigator.clipboard.writeText(code);
      copyBtn.textContent = '✅ Copiado';
      setTimeout(() => (copyBtn.textContent = '📋 Copiar código'), 1500);
    });

    const pushBtn = el('button', 'btn btn-primary', '⬆ Subir progreso ahora');
    const status = el('div', 'cloud-status');
    addTap(pushBtn, async () => {
      status.textContent = 'Subiendo…';
      const res = await this.app.cloud.push();
      status.textContent = res.ok ? 'Progreso subido ✅' : `Error: ${res.reason}`;
    });

    wrap.append(codeBox, copyBtn, pushBtn, status);

    const divider = el('div', 'cloud-divider', '— o continúa un progreso existente —');
    const input = el('input', 'sync-code-input');
    input.placeholder = 'XXXX-XXXX';
    const pullBtn = el('button', 'btn btn-secondary', '⬇ Traer progreso de ese código');
    const pullStatus = el('div', 'cloud-status');
    addTap(pullBtn, async () => {
      const value = input.value.trim().toUpperCase();
      if (!value) return;
      if (!confirm('Esto va a reemplazar tu progreso actual en este dispositivo con el del código ingresado. ¿Continuar?')) return;
      pullStatus.textContent = 'Buscando…';
      const res = await this.app.cloud.pull(value);
      if (res.ok) {
        pullStatus.textContent = 'Progreso cargado ✅';
        setTimeout(() => this.render(), 800);
      } else {
        pullStatus.textContent = `Error: ${res.reason === 'not-found' ? 'código no encontrado' : res.reason}`;
      }
    });

    wrap.append(divider, input, pullBtn, pullStatus);
    this.root.append(wrap);
  }

  unmount() {}
}
