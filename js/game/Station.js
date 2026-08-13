// Una estación pasa por: idle -> working -> (si quema) done -> idle.
//
// Las estaciones de fuego no entregan el platillo solas: al terminar lo dejan
// listo sobre el fuego y hay que recogerlo tocando la estación. Si nadie lo
// recoge dentro del margen, se quema y se pierde. Cortar y emplatar no queman,
// así que ahí el platillo avanza solo como siempre.
export class Station {
  constructor(type, name, emoji, { burns = false, burnGraceMs = 4500 } = {}) {
    this.type = type;
    this.name = name;
    this.emoji = emoji;
    this.burns = burns;
    this.burnGraceMs = burnGraceMs;

    this.state = 'idle'; // idle | working | done
    this.plate = null;
    this.timeLeft = 0;
    this.totalTime = 0;
    this.burnLeft = 0;
  }

  get busy() {
    return this.state !== 'idle';
  }

  get waitingPickup() {
    return this.state === 'done';
  }

  start(plate, duration) {
    this.state = 'working';
    this.plate = plate;
    plate.atStation = true;
    this.timeLeft = duration;
    this.totalTime = duration;
  }

  _release() {
    const plate = this.plate;
    this.plate = null;
    this.state = 'idle';
    this.timeLeft = 0;
    this.burnLeft = 0;
    return plate;
  }

  // Devuelve null, o un evento: {type:'advanced'|'cooked'|'burnt', plate}
  update(dt) {
    if (this.state === 'working') {
      this.timeLeft -= dt;
      if (this.timeLeft > 0) return null;
      this.timeLeft = 0;

      if (this.burns) {
        this.state = 'done';
        this.burnLeft = this.burnGraceMs;
        return { type: 'cooked', plate: this.plate };
      }
      const plate = this._release();
      plate.advance();
      return { type: 'advanced', plate };
    }

    if (this.state === 'done') {
      this.burnLeft -= dt;
      if (this.burnLeft > 0) return null;
      const plate = this._release();
      plate.burnt = true;
      return { type: 'burnt', plate };
    }

    return null;
  }

  // Recoger el platillo listo sobre el fuego antes de que se queme.
  collect() {
    if (this.state !== 'done') return null;
    const plate = this._release();
    plate.advance();
    return plate;
  }

  progressRatio() {
    if (this.state !== 'working' || this.totalTime <= 0) return 0;
    return 1 - this.timeLeft / this.totalTime;
  }

  // Cuánto margen queda antes de quemarse, de 1 a 0.
  burnRatio() {
    if (this.state !== 'done' || this.burnGraceMs <= 0) return 0;
    return Math.max(0, this.burnLeft / this.burnGraceMs);
  }
}
