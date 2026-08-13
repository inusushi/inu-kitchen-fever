import { SaveManager } from './core/SaveManager.js';
import { SceneManager } from './core/SceneManager.js';
import { AudioManager } from './core/AudioManager.js';
import { CloudSync } from './core/CloudSync.js';
import { MenuScene } from './scenes/MenuScene.js';

const root = document.getElementById('app');
const sceneManager = new SceneManager(root);

const save = new SaveManager();

const app = {
  save,
  audio: new AudioManager(save),
  cloud: new CloudSync(save),
  goTo: (SceneClass, params) => sceneManager.goTo(SceneClass, app, params),
};

app.goTo(MenuScene);
