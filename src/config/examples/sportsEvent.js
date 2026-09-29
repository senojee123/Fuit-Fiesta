/**
 * Example alternate config — Sports Event theme.
 * Copy this file's contents into src/config/gameConfig.js (or load it
 * instead) to reskin the game without touching engine code.
 */
const gameConfig = {
  gameName: "Trophy Slice",
  organizationName: "National Sports Fest 2026",
  tagline: "Slice your way to the podium!",

  theme: {
    background: "#1B5E20",
    backgroundGradient: ["#1B5E20", "#43A047"],
    primaryColor: "#FFD600",
    secondaryColor: "#FF5722",
    textColor: "#FFFFFF",
    uiPanelColor: "rgba(0,0,0,0.5)",
    fontFamily: "'Baloo 2', sans-serif",
    logo: null,
  },

  objects: [
    { name: "Football",   emoji: "⚽", points: 10, size: 46, speedMultiplier: 1,   rotationSpeed: 0.05, weight: 10 },
    { name: "Basketball", emoji: "🏀", points: 10, size: 46, speedMultiplier: 1.05, rotationSpeed: 0.05, weight: 10 },
    { name: "Trophy",     emoji: "🏆", points: 40, size: 50, speedMultiplier: 0.9, rotationSpeed: 0.03, weight: 3, rare: true },
    { name: "Medal",      emoji: "🥇", points: 25, size: 42, speedMultiplier: 1,   rotationSpeed: 0.04, weight: 5 },
  ],

  hazards: [
    { name: "RedCard", emoji: "🟥", penalty: "loseLife", size: 40, speedMultiplier: 1, rotationSpeed: 0.04, weight: 4 },
  ],

  gameDuration: 45,
  lives: 3,
  gameMode: "classic",
  challengeTargetScore: 200,

  difficulty: {
    level: "medium",
    presets: {
      easy:   { spawnIntervalMs: 1100, objectSpeed: 0.75, maxOnScreen: 4, hazardChance: 0.08 },
      medium: { spawnIntervalMs: 800,  objectSpeed: 1,    maxOnScreen: 6, hazardChance: 0.15 },
      hard:   { spawnIntervalMs: 550,  objectSpeed: 1.35, maxOnScreen: 8, hazardChance: 0.25 },
    },
    custom: { spawnIntervalMs: 700, objectSpeed: 1.1, maxOnScreen: 7, hazardChance: 0.2 },
  },

  kidsMode: { disableHazards: true, speedMultiplier: 0.6, extraRewardChance: 0.3 },

  scoring: {
    comboEnabled: true,
    comboWindowMs: 900,
    comboMultiplier: 2,
    comboThreshold: 3,
    missPenalty: 0,
  },

  rewards: {
    thresholds: [
      { minScore: 0,   message: "Good hustle! Try again?", badge: null },
      { minScore: 120, message: "🥈 Silver-level slicer!", badge: null },
      { minScore: 250, message: "🏆 Gold Medal Slicer!", badge: null },
    ],
    showQrCode: true,
    couponCode: "SPORTSFEST2026",
    shareText: "I scored {score} points in {gameName}! Beat that!",
  },

  sounds: {
    slice: "assets/sounds/slice.mp3",
    explosion: "assets/sounds/explosion.mp3",
    combo: "assets/sounds/combo.mp3",
    background: "assets/sounds/music.mp3",
    gameOver: "assets/sounds/gameover.mp3",
    musicVolume: 0.4,
    sfxVolume: 0.8,
  },

  leaderboard: { enabled: false, eventId: "sports-fest-2026", submitUrl: null, onSubmit: null },
};

if (typeof module !== "undefined" && module.exports) module.exports = gameConfig;
