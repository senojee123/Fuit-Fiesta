/**
 * gameEngine.js — the core reusable loop. Contains ZERO hard-coded content:
 * every fruit/hazard/rule/color comes from gameConfig. Swap the config,
 * get a different game.
 */

class FlyingObject {
  constructor(def, body, isHazard) {
    this.def = def;
    this.body = body;
    this.isHazard = isHazard;
    this.sliced = false;
    this.missed = false;
    this.image = null;
    if (def.image) {
      const img = new Image();
      img.src = def.image;
      img.onload = () => (this.image = img);
    }
  }

  draw(ctx) {
    const { x, y, rotation } = this.body;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    const size = this.def.size || 45;
    if (this.image) {
      ctx.drawImage(this.image, -size / 2, -size / 2, size, size);
    } else {
      ctx.font = `${size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.def.emoji || "❓", 0, 0);
    }
    ctx.restore();
  }
}

class GameEngine {
  /**
   * @param {object} config gameConfig
   * @param {HTMLCanvasElement} canvas
   * @param {UIManager} ui
   */
  constructor(config, canvas, ui) {
    this.config = config;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ui = ui;

    this.scoring = new ScoringSystem(config);
    this.particles = new ParticleSystem();
    this.input = new InputHandler(canvas, (seg) => this._handleSlice(seg));

    this.sounds = this._loadSounds(config.sounds || {});

    this.objects = [];
    this.running = false;
    this.timeLeft = config.gameDuration;
    this.lives = config.lives;
    this.spawnTimer = 0;
    this.lastFrameTime = 0;
    this.slicedTotal = 0;

    this._applyModeOverrides();
    this._resizeCanvas();
    window.addEventListener("resize", () => this._resizeCanvas());
  }

  _applyModeOverrides() {
    const { gameMode, kidsMode } = this.config;
    this.effectiveHazardsDisabled = false;
    this.speedScale = 1;
    this.rewardBonusChance = 0;

    if (gameMode === "kids" && kidsMode) {
      this.effectiveHazardsDisabled = !!kidsMode.disableHazards;
      this.speedScale = kidsMode.speedMultiplier || 1;
      this.rewardBonusChance = kidsMode.extraRewardChance || 0;
    }
  }

  _resizeCanvas() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.clientWidth;
    this.canvas.height = parent.clientHeight;
  }

  _loadSounds(cfg) {
    const make = (src) => {
      if (!src) return null;
      const audio = new Audio(src);
      audio.onerror = () => {}; // missing asset is fine, fail silently
      return audio;
    };
    return {
      slice: make(cfg.slice),
      explosion: make(cfg.explosion),
      combo: make(cfg.combo),
      background: make(cfg.background),
      gameOver: make(cfg.gameOver),
      musicVolume: cfg.musicVolume ?? 0.4,
      sfxVolume: cfg.sfxVolume ?? 0.8,
    };
  }

  _playSfx(audio) {
    if (!audio) return;
    try {
      const clone = audio.cloneNode();
      clone.volume = this.sounds.sfxVolume;
      clone.play().catch(() => {});
    } catch (e) {}
  }

  start() {
    this.scoring.reset();
    this.objects = [];
    this.timeLeft = this.config.gameDuration;
    this.lives = this.config.lives;
    this.spawnTimer = 0;
    this.running = true;
    this.lastFrameTime = performance.now();

    if (this.sounds.background) {
      this.sounds.background.loop = true;
      this.sounds.background.volume = this.sounds.musicVolume;
      this.sounds.background.play().catch(() => {});
    }

    this.ui.showGame();
    this.ui.updateScore(0);
    this.ui.updateLives(this.lives);
    this.ui.updateTimer(this.timeLeft);
    requestAnimationFrame((t) => this._loop(t));
  }

  stop(reason) {
    this.running = false;
    if (this.sounds.background) this.sounds.background.pause();
    if (this.sounds.gameOver) this._playSfx(this.sounds.gameOver);

    const score = this.scoring.score;
    const reward = this._computeReward(score);

    this._submitLeaderboard(score);
    this.ui.showEnd({ score, message: reward.message, badge: reward.badge });
  }

  _computeReward(score) {
    const thresholds = (this.config.rewards && this.config.rewards.thresholds) || [];
    let best = { message: "Thanks for playing!", badge: null };
    for (const t of thresholds) {
      if (score >= t.minScore) best = t;
    }
    return best;
  }

  _submitLeaderboard(score) {
    const lb = this.config.leaderboard;
    if (!lb || !lb.enabled) return;
    const payload = {
      user: window.__fruitSlicePlayerName || "Player",
      event: lb.eventId,
      score,
      game: this.config.gameName,
      timestamp: new Date().toISOString(),
    };
    if (typeof lb.onSubmit === "function") {
      lb.onSubmit(payload);
    } else if (lb.submitUrl) {
      fetch(lb.submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    }
  }

  _currentDifficulty() {
    const d = this.config.difficulty;
    if (d.level === "custom") return d.custom;
    return d.presets[d.level] || d.presets.medium;
  }

  _pickWeighted(list) {
    const total = list.reduce((sum, o) => sum + (o.weight || 1), 0);
    let r = Math.random() * total;
    for (const item of list) {
      r -= item.weight || 1;
      if (r <= 0) return item;
    }
    return list[list.length - 1];
  }

  _spawnObject() {
    const diff = this._currentDifficulty();
    const useHazard =
      !this.effectiveHazardsDisabled &&
      this.config.hazards.length > 0 &&
      Math.random() < diff.hazardChance;

    const def = useHazard ? this._pickWeighted(this.config.hazards) : this._pickWeighted(this.config.objects);
    const x = 60 + Math.random() * (this.canvas.width - 120);
    const speedMult = (def.speedMultiplier || 1) * diff.objectSpeed * this.speedScale;
    const { vx, vy } = launchVelocity(this.canvas.width, this.canvas.height, speedMult);
    const body = new PhysicsBody({
      x,
      y: this.canvas.height + 60,
      vx,
      vy,
      rotationSpeed: (def.rotationSpeed || 0.04) * (Math.random() < 0.5 ? -1 : 1),
    });
    this.objects.push(new FlyingObject(def, body, useHazard));
  }

  _handleSlice(seg) {
    if (!this.running) return;
    for (const obj of this.objects) {
      if (obj.sliced) continue;
      const radius = (obj.def.size || 45) / 2;
      if (segmentIntersectsCircle(seg.x1, seg.y1, seg.x2, seg.y2, obj.body.x, obj.body.y, radius)) {
        obj.sliced = true;
        this._onObjectSliced(obj);
      }
    }
  }

  _onObjectSliced(obj) {
    if (obj.isHazard) {
      this._playSfx(this.sounds.explosion);
      this.particles.burst(obj.body.x, obj.body.y, "#333", 20);
      this._applyHazardPenalty(obj.def);
    } else {
      this._playSfx(this.sounds.slice);
      const { points, combo, comboActive } = this.scoring.registerSlice(obj.def.points, performance.now());
      this.slicedTotal += 1;
      this.particles.burst(obj.body.x, obj.body.y, this.config.theme.primaryColor, 14);
      this.particles.popup(obj.body.x, obj.body.y, `+${points}`, comboActive ? this.config.theme.secondaryColor : "#fff");
      if (comboActive) this._playSfx(this.sounds.combo);

      this.ui.updateScore(this.scoring.score);
      this.ui.updateCombo(combo, comboActive);

      if (this.config.gameMode === "challenge" && this.scoring.score >= this.config.challengeTargetScore) {
        this.stop("challenge-complete");
      }
    }
  }

  _applyHazardPenalty(def) {
    const penalty = def.penalty;
    if (penalty === "gameover") {
      this.stop("hazard");
      return;
    }
    if (penalty === "loseLife") {
      if (this.config.lives > 0) {
        this.lives -= 1;
        this.ui.updateLives(this.lives);
        if (this.lives <= 0) {
          this.stop("no-lives");
        }
      }
    } else if (typeof penalty === "number") {
      this.scoring.registerHazardPenalty(penalty);
      this.ui.updateScore(this.scoring.score);
    }
  }

  _loop(now) {
    if (!this.running) return;
    const dt = Math.min((now - this.lastFrameTime) / 16.67, 3); // normalize to ~60fps steps
    this.lastFrameTime = now;

    this._update(dt, now);
    this._render();

    requestAnimationFrame((t) => this._loop(t));
  }

  _update(dt, now) {
    // Timer (skip in unlimited mode, i.e. gameDuration === 0)
    if (this.config.gameDuration > 0) {
      this.timeLeft -= dt / 60;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.ui.updateTimer(0);
        this.stop("time-up");
        return;
      }
      this.ui.updateTimer(Math.ceil(this.timeLeft));
    }

    // Spawning
    const diff = this._currentDifficulty();
    this.spawnTimer += dt * 16.67;
    if (this.spawnTimer >= diff.spawnIntervalMs && this.objects.length < diff.maxOnScreen) {
      this.spawnTimer = 0;
      this._spawnObject();
    }

    // Physics + missed-object detection
    for (const obj of this.objects) {
      obj.body.update(dt);
      if (!obj.sliced && !obj.missed && obj.body.isOffScreen(this.canvas.width, this.canvas.height)) {
        obj.missed = true;
        if (!obj.isHazard) {
          this.scoring.registerMiss();
          this.ui.updateCombo(0, false);
        }
      }
    }
    this.objects = this.objects.filter(
      (o) => !o.body.isOffScreen(this.canvas.width, this.canvas.height, 150) || (!o.sliced && !o.missed)
    );
    // Remove sliced objects after a short beat so they can register visually
    this.objects = this.objects.filter((o) => !o.sliced);

    this.particles.update();
  }

  _render() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height);

    // background handled by CSS gradient behind transparent canvas

    for (const obj of this.objects) obj.draw(ctx);

    // slice trail
    const trail = this.input.getTrail();
    if (trail.length > 1) {
      ctx.save();
      ctx.strokeStyle = this.config.theme.secondaryColor;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (const p of trail) ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.restore();
    }

    this.particles.draw(ctx);
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { GameEngine, FlyingObject };
}
