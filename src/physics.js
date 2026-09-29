/**
 * physics.js — simple gravity/velocity model for flying objects.
 * No knowledge of game rules or rendering; pure kinematics.
 */

const GRAVITY = 0.35; // px/frame^2, tuned for canvas-space, not real units

class PhysicsBody {
  constructor({ x, y, vx, vy, rotation = 0, rotationSpeed = 0 }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.rotation = rotation;
    this.rotationSpeed = rotationSpeed;
  }

  update(dtScale = 1) {
    this.vy += GRAVITY * dtScale;
    this.x += this.vx * dtScale;
    this.y += this.vy * dtScale;
    this.rotation += this.rotationSpeed * dtScale;
  }

  isOffScreen(width, height, margin = 100) {
    return this.y - margin > height || this.x < -margin || this.x > width + margin;
  }
}

/**
 * Compute a launch velocity that sends an object from the bottom of the
 * screen to roughly `apexY` before gravity pulls it back down.
 */
function launchVelocity(canvasWidth, canvasHeight, speedMultiplier = 1) {
  const apexY = canvasHeight * (0.15 + Math.random() * 0.2);
  const startY = canvasHeight + 60;
  const dist = startY - apexY;
  const vy = -Math.sqrt(2 * GRAVITY * dist) * speedMultiplier;
  const vx = (Math.random() - 0.5) * 6 * speedMultiplier;
  return { vy, vx };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PhysicsBody, launchVelocity, GRAVITY };
}
