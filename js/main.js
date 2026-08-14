import { SaveManager } from './core/SaveManager.js';
import { SceneManager } from './core/SceneManager.js';
import { AudioManager } from './core/AudioManager.js';
import { CloudSync } from './core/CloudSync.js';
import { Leaderboard } from './core/Leaderboard.js';
import { applyA11ySettings } from './core/accessibility.js';
import { MenuScene } from './scenes/MenuScene.js';

const root = document.getElementById('app');
const sceneManager = new SceneManager(root);

const save = new SaveManager();
applyA11ySettings(save.state.settings);
const cloud = new CloudSync(save);

const app = {
  save,
  cloud,
  audio: new AudioManager(save),
  leaderboard: new Leaderboard(cloud),
  goTo: (SceneClass, params) => sceneManager.goTo(SceneClass, app, params),
};

app.goTo(MenuScene);

// El navegador bloquea audio hasta el primer gesto del usuario; arrancamos
// la música ambiental en cuanto toque cualquier cosa, una sola vez.
document.addEventListener('pointerdown', () => app.audio.startMusic(), { once: true });
