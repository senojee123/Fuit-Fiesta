/**
 * gameConfig.js — the ONLY file most organizers need to touch.
 *
 * Every visual, gameplay, and content aspect of the game is driven from
 * this object. The engine (src/*.js) never hard-codes fruit names, colors,
 * durations, etc. — it just reads `gameConfig` at runtime.
 *
 * Objects/hazards support either an `emoji` (zero-asset, works instantly)
 * or an `image` path (PNG/SVG). If `image` fails to load, the engine falls
 * back to the emoji automatically.
 */

const gameConfig = {
  // ---- Branding -----------------------------------------------------
  gameName: "Fruit Slice",
  organizationName: "Children's Day 2026",
  tagline: "Slice your way to victory!",

  theme: {
    background: "#87CEEB",       // sky background (or gradient, see backgroundGradient)
    backgroundGradient: ["#87CEEB", "#E0F7FA"],
    primaryColor: "#FF5722",
    secondaryColor: "#FFC107",
    textColor: "#212121",
    uiPanelColor: "rgba(255,255,255,0.85)",
    fontFamily: "'Baloo 2', 'Segoe UI', sans-serif",
    logo: null,                  // e.g. "assets/themes/logo.png"
    loadingBackground: null,     // e.g. "assets/themes/loading-bg.jpg"
  },

  // ---- Sliceable objects ---------------------------------------------
  // Each object: name, emoji (fallback/default render), image (optional),
  // points, size (px radius), speed multiplier, rotation speed (rad/frame),
  // and optional `rare` flag + weight for spawn probability.
  objects: [
    { name: "Apple",      emoji: "🍎", image: null, points: 10, size: 45, speedMultiplier: 1,   rotationSpeed: 0.04, weight: 10 },
    { name: "Watermelon", emoji: "🍉", image: null, points: 15, size: 55, speedMultiplier: 0.85, rotationSpeed: 0.03, weight: 8 },
    { name: "Banana",     emoji: "🍌", image: null, points: 10, size: 42, speedMultiplier: 1.1,  rotationSpeed: 0.05, weight: 10 },
    { name: "Orange",     emoji: "🍊", image: null, points: 10, size: 44, speedMultiplier: 1,    rotationSpeed: 0.04, weight: 10 },
    { name: "GoldenApple", emoji: "✨", image: null, points: 50, size: 48, speedMultiplier: 1.2, rotationSpeed: 0.06, weight: 2, rare: true },
  ],

  // Hazards: slicing these triggers a penalty instead of points.
  // penalty: "gameover" | "loseLife" | number (negative points)
  hazards: [
    { name: "Bomb", emoji: "💣", image: null, penalty: "loseLife", size: 46, speedMultiplier: 1, rotationSpeed: 0.05, weight: 4 },
  ],

  // ---- Gameplay rules --------------------------------------------------
  gameDuration: 60,     // seconds; 0 = unlimited (use targetScore mode instead)
  lives: 3,             // 0 = unlimited lives (hazards just cost points)

  // "classic" | "timeAttack" | "kids" | "challenge"
  gameMode: "classic",
  challengeTargetScore: 200, // used only in "challenge" mode

  difficulty: {
    level: "medium", // "easy" | "medium" | "hard" | "custom"
    presets: {
      easy:   { spawnIntervalMs: 1100, objectSpeed: 0.75, maxOnScreen: 4, hazardChance: 0.08 },
      medium: { spawnIntervalMs: 800,  objectSpeed: 1,    maxOnScreen: 6, hazardChance: 0.15 },
      hard:   { spawnIntervalMs: 550,  objectSpeed: 1.35, maxOnScreen: 8, hazardChance: 0.25 },
    },
    // Only used when level === "custom"
    custom: { spawnIntervalMs: 700, objectSpeed: 1.1, maxOnScreen: 7, hazardChance: 0.2 },
  },

  // Kids Mode overrides (applied automatically when gameMode === "kids")
  kidsMode: {
    disableHazards: true,
    speedMultiplier: 0.6,
    extraRewardChance: 0.3,
  },

  // ---- Scoring ----------------------------------------------------------
  scoring: {
    comboEnabled: true,
    comboWindowMs: 900,     // time between slices to keep combo alive
    comboMultiplier: 2,     // applied once combo streak >= comboThreshold
    comboThreshold: 3,
    missPenalty: 0,         // points lost per missed (fallen) object, 0 = none
  },

  // ---- Rewards / end screen ----------------------------------------------
  rewards: {
    thresholds: [
      { minScore: 0,   message: "Nice try! Play again?", badge: null },
      { minScore: 100, message: "🎉 You're a Fruit Slicer!", badge: "assets/themes/badge_bronze.png" },
      { minScore: 250, message: "🏆 Amazing! You are a Fruit Master!", badge: "assets/themes/badge_gold.png" },
    ],
    showQrCode: true,
    couponCode: "CHILDRENSDAY2026",
    shareText: "I scored {score} points in {gameName}! Can you beat me?",
  },

  // ---- Sounds (optional; engine no-ops silently if files are missing) ----
  sounds: {
    slice: "assets/sounds/slice.mp3",
    explosion: "assets/sounds/explosion.mp3",
    combo: "assets/sounds/combo.mp3",
    background: "assets/sounds/music.mp3",
    gameOver: "assets/sounds/gameover.mp3",
    musicVolume: 0.4,
    sfxVolume: 0.8,
  },

  // ---- Leaderboard / API hooks --------------------------------------------
  leaderboard: {
    enabled: false,
    eventId: "childrens-day-2026",
    submitUrl: null, // e.g. "https://api.fanforge.example/scores"
    // Called instead of a real fetch when submitUrl is null — lets the
    // host page (or FanForge admin) intercept results without editing
    // engine code.
    onSubmit: null, // function(payload) {}
  },
};

// Support both classic <script> include and ES module usage.
if (typeof module !== "undefined" && module.exports) {
  module.exports = gameConfig;
}
