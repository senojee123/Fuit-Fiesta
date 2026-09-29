/**
 * scoring.js — combo-aware scoring, decoupled from rendering/gameplay loop.
 */

class ScoringSystem {
  constructor(config) {
    this.config = config.scoring || {};
    this.score = 0;
    this.combo = 0;
    this.lastSliceTime = 0;
    this.slicedCount = 0;
  }

  reset() {
    this.score = 0;
    this.combo = 0;
    this.lastSliceTime = 0;
    this.slicedCount = 0;
  }

  /**
   * @param {number} basePoints
   * @param {number} now performance.now() timestamp
   * @returns {{points:number, combo:number, comboActive:boolean}}
   */
  registerSlice(basePoints, now) {
    const { comboEnabled, comboWindowMs = 900, comboMultiplier = 2, comboThreshold = 3 } = this.config;

    if (comboEnabled) {
      if (now - this.lastSliceTime <= comboWindowMs) {
        this.combo += 1;
      } else {
        this.combo = 1;
      }
      this.lastSliceTime = now;
    }

    const comboActive = comboEnabled && this.combo >= comboThreshold;
    const points = comboActive ? Math.round(basePoints * comboMultiplier) : basePoints;

    this.score += points;
    this.slicedCount += 1;

    return { points, combo: this.combo, comboActive };
  }

  registerMiss() {
    const penalty = this.config.missPenalty || 0;
    if (penalty) this.score = Math.max(0, this.score - penalty);
    this.combo = 0;
  }

  registerHazardPenalty(points) {
    this.score = Math.max(0, this.score + points); // points expected negative
    this.combo = 0;
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ScoringSystem;
}
