/**
 * particles.js — juice: slice splatter particles + floating score popups.
 */

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 1.5) * 8;
    this.life = 1;
    this.decay = 0.02 + Math.random() * 0.02;
    this.color = color;
    this.size = 3 + Math.random() * 4;
  }

  update() {
    this.vy += 0.25;
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(this.life, 0);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class ScorePopup {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 1;
  }

  update() {
    this.y -= 1.2;
    this.life -= 0.02;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(this.life, 0);
    ctx.fillStyle = this.color;
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.popups = [];
  }

  burst(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) this.particles.push(new Particle(x, y, color));
  }

  popup(x, y, text, color = "#FFF") {
    this.popups.push(new ScorePopup(x, y, text, color));
  }

  update() {
    this.particles.forEach((p) => p.update());
    this.particles = this.particles.filter((p) => p.life > 0);
    this.popups.forEach((p) => p.update());
    this.popups = this.popups.filter((p) => p.life > 0);
  }

  draw(ctx) {
    this.particles.forEach((p) => p.draw(ctx));
    this.popups.forEach((p) => p.draw(ctx));
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { ParticleSystem };
}
