import { el, addTap } from '../utils/helpers.js';
import { LEVELS } from '../data/levels.js';
import { displayNickname } from '../game/nickname.js';
import { LevelSelectScene } from './LevelSelectScene.js';

export class LeaderboardScene {
  constructor(app, params = {}) {
    this.app = app;
    this.levelIndex = params.levelIndex ?? 0;
  }

  mount(root) {
    this.root = root;
    this.render();
    this.load();
  }

  render(rows = null, error = null, loading = true) {
    this.root.innerHTML = '';
    const wrap = el('div', 'screen leaderboard-screen');

    const header = el('div', 'top-bar');
    const backBtn = el('button', 'btn btn-icon', '←');
    addTap(backBtn, () => this.app.goTo(LevelSelectScene));
    header.append(backBtn, el('h2', 'top-bar-title', '🏆 Mejores marcas'));
    wrap.append(header);

    // Selector de nivel
    const picker = el('div', 'lb-levels');
    LEVELS.forEach((level, i) => {
      const btn = el('button', `lb-level-btn${i === this.levelIndex ? ' active' : ''}`, level.emoji);
      btn.title = level.name;
      addTap(btn, () => {
        this.levelIndex = i;
        this.render();
        this.load();
      });
      picker.append(btn);
    });
    wrap.append(picker);
    wrap.append(el('div', 'lb-level-name', LEVELS[this.levelIndex].name));

    if (!this.app.leaderboard.configured) {
      wrap.append(el('p', 'cloud-note', 'El ranking necesita la nube conectada.'));
      this.root.append(wrap);
      return;
    }

    if (loading) {
      wrap.append(el('p', 'cloud-note', 'Cargando marcas…'));
    } else if (error) {
      wrap.append(el('p', 'cloud-note', `No se pudo cargar: ${error}`));
    } else if (!rows.length) {
      wrap.append(el('p', 'cloud-note', 'Todavía nadie ha publicado una marca en este nivel. ¡Sé el primero!'));
    } else {
      const list = el('div', 'lb-list');
      rows.forEach((row, i) => {
        const item = el('div', `lb-row${i < 3 ? ' podium' : ''}`);
        const medal = ['🥇', '🥈', '🥉'][i] || `${i + 1}.`;
        item.append(el('span', 'lb-pos', medal));
        item.append(el('span', 'lb-name', displayNickname(row.nickname)));
        item.append(el('span', 'lb-stars', '⭐'.repeat(row.stars)));
        item.append(el('span', 'lb-coins', `💰${row.coins}`));
        list.append(item);
      });
      wrap.append(list);
    }

    this.root.append(wrap);
  }

  async load() {
    if (!this.app.leaderboard.configured) return;
    const levelId = LEVELS[this.levelIndex].id;
    const res = await this.app.leaderboard.top(levelId);
    // Si el jugador cambió de nivel mientras cargaba, esta respuesta ya no sirve.
    if (LEVELS[this.levelIndex].id !== levelId) return;
    this.render(res.rows, res.ok ? null : res.reason, false);
  }

  unmount() {}
}
