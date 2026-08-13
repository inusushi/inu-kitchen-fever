export class SceneManager {
  constructor(root) {
    this.root = root;
    this.current = null;
    this.lastTime = 0;
    this.rafId = null;
    this._loop = this._loop.bind(this);
  }

  goTo(SceneClass, app, params) {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.current && this.current.unmount) this.current.unmount();
    this.root.innerHTML = '';
    this.current = new SceneClass(app, params);
    this.current.mount(this.root);
    if (this.current.tick) {
      this.lastTime = performance.now();
      this.rafId = requestAnimationFrame(this._loop);
    }
  }

  _loop(now) {
    const dt = Math.min(100, now - this.lastTime);
    this.lastTime = now;
    if (this.current && this.current.tick) {
      this.current.tick(dt);
      this.rafId = requestAnimationFrame(this._loop);
    }
  }
}
