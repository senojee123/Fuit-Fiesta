/**
 * Example alternate config — Brand Promotion theme.
 * Replace emoji with `image` paths pointing at product/logo PNGs for a
 * fully branded activation.
 */
const gameConfig = {
  gameName: "Slice & Win",
  organizationName: "Acme Co. Product Launch",
  tagline: "Slice products, win prizes!",

  theme: {
    background: "#0D1B2A",
    backgroundGradient: ["#0D1B2A", "#1B263B"],
    primaryColor: "#00B4D8",
    secondaryColor: "#FFD60A",
    textColor: "#FFFFFF",
    uiPanelColor: "rgba(13,27,42,0.75)",
    fontFamily: "'Baloo 2', sans-serif",
    logo: "assets/themes/acme-logo.png",
  },

  objects: [
    { name: "ProductA", emoji: "📦", image: "assets/objects/product-a.png", points: 15, size: 48, speedMultiplier: 1, rotationSpeed: 0.04, weight: 10 },
    { name: "ProductB", emoji: "🎁", image: "assets/objects/product-b.png", points: 15, size: 48, speedMultiplier: 1, rotationSpeed: 0.04, weight: 10 },
    { name: "GoldCoupon", emoji: "🪙", image: null, points: 60, size: 44, speedMultiplier: 1.1, rotationSpeed: 0.06, weight: 2, rare: true },
  ],

  hazards: [
    { name: "Competitor", emoji: "🚫", penalty: -30, size: 44, speedMultiplier: 1, rotationSpeed: 0.04, weight: 5 },
  ],

  gameDuration: 30,
  lives: 0,
  gameMode: "timeAttack",
  challengeTargetScore: 200,

  difficulty: {
    level: "hard",
    presets: {
      easy:   { spawnIntervalMs: 1100, objectSpeed: 0.75, maxOnScreen: 4, hazardChance: 0.08 },
      medium: { spawnIntervalMs: 800,  objectSpeed: 1,    maxOnScreen: 6, hazardChance: 0.15 },
      hard:   { spawnIntervalMs: 550,  objectSpeed: 1.35, maxOnScreen: 8, hazardChance: 0.25 },
    },
    custom: { spawnIntervalMs: 700, objectSpeed: 1.1, maxOnScreen: 7, hazardChance: 0.2 },
  },

  kidsMode: { disableHazards: true, speedMultiplier: 0.6, extraRewardChance: 0.3 },

  scoring: { comboEnabled: true, comboWindowMs: 800, comboMultiplier: 3, comboThreshold: 4, missPenalty: 0 },

  rewards: {
    thresholds: [
      { minScore: 0,   message: "Thanks for playing! Visit our booth for a surprise.", badge: null },
      { minScore: 150, message: "🎉 You unlocked a 10% discount code!", badge: null },
      { minScore: 300, message: "🏆 Grand prize eligible! Show this screen at the booth.", badge: null },
    ],
    showQrCode: true,
    couponCode: "ACME10OFF",
    shareText: "I scored {score} points in {gameName} — try to beat me at the Acme booth!",
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

  leaderboard: { enabled: false, eventId: "acme-launch-2026", submitUrl: null, onSubmit: null },
};

if (typeof module !== "undefined" && module.exports) module.exports = gameConfig;
