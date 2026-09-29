# Customization Guide

Everything about the game — branding, content, rules, rewards — is driven
from one file: [`src/config/gameConfig.js`](src/config/gameConfig.js). The
engine (`src/gameEngine.js` and friends) never hard-codes fruit names,
colors, durations, or messages; it only reads this config object at
runtime. To make a new event's game, copy `gameConfig.js`, change values,
done — no engine code changes needed.

Two full re-skins already exist as references:
- [`src/config/examples/sportsEvent.js`](src/config/examples/sportsEvent.js)
- [`src/config/examples/brandPromo.js`](src/config/examples/brandPromo.js)

To activate one, either paste its contents into `gameConfig.js`, or point
the `<script src="...">` tag in `index.html` at it instead.

---

## How it works

1. `index.html` loads `gameConfig.js` first, then the engine scripts, then
   `main.js`.
2. `main.js` constructs a `UIManager` and a `GameEngine`, both given the
   `gameConfig` object.
3. `UIManager` applies branding to the DOM/CSS on load (`_applyBranding`),
   and renders the start/HUD/end screens using config values.
4. `GameEngine` reads `objects`, `hazards`, `difficulty`, `gameMode`,
   `scoring`, and `rewards` to run the spawn loop, physics, collisions, and
   end-of-game reward logic — never anything hard-coded.

Because of this split, an admin panel (or a script) that generates a
`gameConfig` object from form inputs / uploaded files can drive the whole
game without touching any `src/*.js` engine file.

---

## What you can customize

### 1. Branding (`theme`, top-level fields)

| Field | Controls |
|---|---|
| `gameName` | Page title + start-screen heading |
| `organizationName` | Subtitle under the title |
| `tagline` | Reserved for use in your own UI copy |
| `theme.background` / `backgroundGradient` | Canvas backdrop (solid color or gradient) |
| `theme.primaryColor` / `secondaryColor` | Buttons, slice trail, combo text, splatter color |
| `theme.textColor` | General text color |
| `theme.uiPanelColor` | HUD pill / end-screen panel background |
| `theme.fontFamily` | Font used across all UI |
| `theme.logo` | Path to a logo image shown on the start screen |
| `theme.loadingBackground` | Optional loading-screen background image |

Applied via CSS custom properties (`--primary-color`, etc.), so branding
changes take effect with zero engine code changes.

### 2. Sliceable objects (`objects[]`)

Each entry:

```js
{ name: "Apple", emoji: "🍎", image: null, points: 10, size: 45,
  speedMultiplier: 1, rotationSpeed: 0.04, weight: 10, rare: false }
```

| Field | Meaning |
|---|---|
| `name` | Internal label |
| `emoji` | Zero-asset default render (works with no images at all) |
| `image` | Optional PNG/SVG path; falls back to `emoji` if it fails to load |
| `points` | Score awarded on slice |
| `size` | Render size / collision radius (px) |
| `speedMultiplier` | Scales this object's launch speed relative to others |
| `rotationSpeed` | Spin rate (radians/frame) |
| `weight` | Relative spawn probability vs. other objects |
| `rare` | Convenience flag for bonus items (pair with a low `weight`) |

Supports image upload, name, score value, animation (rotation) speed, and
size out of the box, per the original spec.

### 3. Hazards (`hazards[]`)

Same shape as objects, plus a `penalty`:

| `penalty` value | Effect |
|---|---|
| `"gameover"` | Instantly ends the game |
| `"loseLife"` | Costs one life (only meaningful if `lives > 0`) |
| a negative number, e.g. `-30` | Direct point deduction |

Set `objects` or `hazards` to `[]` (or use Kids Mode, below) to disable a
category entirely.

### 4. Gameplay rules

| Field | Meaning |
|---|---|
| `gameDuration` | Seconds per round; `0` = unlimited (pair with `gameMode: "challenge"`) |
| `lives` | Lives before game over; `0` = unlimited (hazards only cost points then) |
| `gameMode` | `"classic"`, `"timeAttack"`, `"kids"`, or `"challenge"` |
| `challengeTargetScore` | Score that ends the round in `"challenge"` mode ("Slice 20 objects to win"-style goals via point tuning) |
| `kidsMode.disableHazards` | Removes bombs/hazards entirely |
| `kidsMode.speedMultiplier` | Slows all objects |
| `kidsMode.extraRewardChance` | Reserved hook for bonus-reward logic |

### 5. Difficulty (`difficulty`)

```js
difficulty: {
  level: "medium", // "easy" | "medium" | "hard" | "custom"
  presets: {
    easy:   { spawnIntervalMs: 1100, objectSpeed: 0.75, maxOnScreen: 4, hazardChance: 0.08 },
    medium: { spawnIntervalMs: 800,  objectSpeed: 1,    maxOnScreen: 6, hazardChance: 0.15 },
    hard:   { spawnIntervalMs: 550,  objectSpeed: 1.35, maxOnScreen: 8, hazardChance: 0.25 },
  },
  custom: { spawnIntervalMs: 700, objectSpeed: 1.1, maxOnScreen: 7, hazardChance: 0.2 },
}
```

Controls spawn rate, object speed, max objects on screen simultaneously,
and probability that a spawn is a hazard. Set `level: "custom"` to bypass
the presets entirely.

### 6. Scoring (`scoring`)

| Field | Meaning |
|---|---|
| `comboEnabled` | Turn combo scoring on/off |
| `comboWindowMs` | Max gap between slices to keep a combo alive |
| `comboThreshold` | Streak length needed to activate the multiplier |
| `comboMultiplier` | Points multiplier once combo is active |
| `missPenalty` | Points lost per missed (fallen, unsliced) object; `0` disables |

### 7. Rewards & end screen (`rewards`)

```js
rewards: {
  thresholds: [
    { minScore: 0,   message: "Nice try! Play again?", badge: null },
    { minScore: 100, message: "🎉 You're a Fruit Slicer!", badge: "assets/themes/badge_bronze.png" },
    { minScore: 250, message: "🏆 Amazing! You are a Fruit Master!", badge: "assets/themes/badge_gold.png" },
  ],
  showQrCode: true,
  couponCode: "CHILDRENSDAY2026",
  shareText: "I scored {score} points in {gameName}! Can you beat me?",
}
```

- `thresholds` — the highest `minScore` the final score qualifies for wins;
  its `message` and `badge` are shown on the end screen.
- `showQrCode` — renders a canvas-based code encoding score + coupon (swap
  in a real QR library if scannability matters).
- `couponCode` — shown as text on the end screen.
- `shareText` — supports `{score}` and `{gameName}` placeholders; used by
  the native Web Share API (falls back to clipboard copy).

### 8. Sounds (`sounds`)

```js
sounds: {
  slice: "assets/sounds/slice.mp3",
  explosion: "assets/sounds/explosion.mp3",
  combo: "assets/sounds/combo.mp3",
  background: "assets/sounds/music.mp3",
  gameOver: "assets/sounds/gameover.mp3",
  musicVolume: 0.4,
  sfxVolume: 0.8,
}
```

All optional — missing files fail silently, no crash. Drop replacement
`.mp3` files into `assets/sounds/` and point the paths at them.

### 9. Leaderboard hooks (`leaderboard`)

```js
leaderboard: {
  enabled: false,
  eventId: "childrens-day-2026",
  submitUrl: null,      // POST JSON here when set
  onSubmit: null,        // or handle the payload yourself: function(payload) {}
}
```

When `enabled: true`, every finished game submits:

```json
{ "user": "Player", "event": "childrens-day-2026", "score": 450, "game": "Fruit Slice", "timestamp": "..." }
```

either via `fetch(submitUrl, ...)` or by calling your own `onSubmit`
function — useful for wiring into a FanForge admin panel without touching
engine code. Set `window.__fruitSlicePlayerName` before the game ends to
customize the submitted player name.

---

## What you should NOT need to edit

- `src/gameEngine.js`, `physics.js`, `collision.js`, `particles.js`,
  `scoring.js`, `inputHandler.js`, `ui.js`, `main.js` — pure engine logic,
  content-agnostic by design.
- `src/style.css` — reads theme colors from CSS variables set at runtime;
  only edit this for structural/layout changes, not per-event branding.

If you find yourself editing one of these files to support a new event,
that's usually a sign the config schema needs a new field instead — keeps
future events editable without code changes.

---

## Adding a brand-new event

1. Copy `src/config/gameConfig.js` to `src/config/examples/<eventName>.js`
   (or overwrite `gameConfig.js` directly for a single-event deployment).
2. Update branding, objects/hazards, duration, difficulty, rewards, sounds.
3. Drop any custom images into `assets/objects/` or `assets/themes/`, and
   sounds into `assets/sounds/`, referencing them by path in the config.
4. Open `index.html` — no build step required.
