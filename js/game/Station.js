export class Station {
  constructor(type, name, emoji) {
    this.type = type;
    this.name = name;
    this.emoji = emoji;
    this.busy = false;
    this.plate = null;
    this.timeLeft = 0;
    this.totalTime = 0;
  }

  start(plate, duration) {
    this.busy = true;
    this.plate = plate;
    plate.atStation = true;
    this.timeLeft = duration;
    this.totalTime = duration;
  }

  update(dt) {
    if (!this.busy) return null;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      const plate = this.plate;
      this.busy = false;
      this.plate = null;
      this.timeLeft = 0;
      plate.advance();
      return plate;
    }
    return null;
  }

  progressRatio() {
    if (!this.busy || this.totalTime <= 0) return 0;
    return 1 - this.timeLeft / this.totalTime;
  }
}
