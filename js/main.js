import { SaveManager } from './core/SaveManager.js';
import { SceneManager } from './core/SceneManager.js';
import { MenuScene } from './scenes/MenuScene.js';

const root = document.getElementById('app');
const sceneManager = new SceneManager(root);

const app = {
  save: new SaveManager(),
  goTo: (SceneClass, params) => sceneManager.goTo(SceneClass, app, params),
};

app.goTo(MenuScene);
