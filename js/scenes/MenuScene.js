import { el, addTap } from '../utils/helpers.js';
import { LevelSelectScene } from './LevelSelectScene.js';
import { CloudScene } from './CloudScene.js';

export class MenuScene {
  constructor(app) {
    this.app = app;
  }

  mount(root) {
    const wrap = el('div', 'screen menu-screen');

    const muteBtn = el('button', 'btn btn-icon mute-btn', this.app.audio.muted ? '🔇' : '🔊');
    addTap(muteBtn, () => {
      const muted = this.app.audio.toggleMute();
      muteBtn.textContent = muted ? '🔇' : '🔊';
    });

    const title = el('h1', 'game-title', 'Cocina Fever');
    const subtitle = el('p', 'game-subtitle', 'Prepara, sirve y no dejes esperar a nadie.');

    const coinsBadge = el('div', 'coins-badge', `💰 ${this.app.save.state.coins}`);

    const playBtn = el('button', 'btn btn-primary btn-big', '▶ Jugar');
    addTap(playBtn, () => {
      this.app.audio.tap();
      this.app.goTo(LevelSelectScene);
    });

    const cloudBtn = el('button', 'btn btn-secondary', '☁ Guardado en la nube');
    addTap(cloudBtn, () => this.app.goTo(CloudScene));

    const resetBtn = el('button', 'btn btn-ghost', 'Reiniciar progreso');
    addTap(resetBtn, () => {
      if (confirm('¿Borrar todo tu progreso guardado?')) {
        this.app.save.reset();
        this.app.goTo(MenuScene);
      }
    });

    wrap.append(muteBtn, title, subtitle, coinsBadge, playBtn, cloudBtn, resetBtn);
    root.append(wrap);
  }

  unmount() {}
}
