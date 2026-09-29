# Fruit Slice — White-Label Arcade Template

A fully customizable, swipe-to-slice arcade game built with plain HTML5,
CSS3, and vanilla JavaScript (Canvas API, no game engine, no build step).
Designed to be re-skinned for any event by editing **one config file**.

## Quick start

Just open `index.html` in a browser, or serve the folder with any static
server (recommended for audio/image loading):

```bash
npx serve .
# or
python -m http.server 8080
```

## Customizing a game

Everything lives in [`src/config/gameConfig.js`](src/config/gameConfig.js):
branding, objects, hazards, difficulty, game mode, scoring, rewards, sounds,
and leaderboard hooks. The engine never references fruit names or colors
directly — it only reads this object.

Two ready-made re-skins are in `src/config/examples/`:
- `sportsEvent.js` — balls/trophies/medals theme
- `brandPromo.js` — product-image based brand activation

To use one, copy its contents into `gameConfig.js` (or swap the `<script>`
tag in `index.html`).

### Objects & hazards

Each object needs only an `emoji` to work with zero assets. Add an `image`
path to use custom artwork instead (falls back to emoji if the image fails
to load):

```js
{ name: "Apple", emoji: "🍎", image: "assets/objects/apple.png", points: 10, size: 45, speedMultiplier: 1, rotationSpeed: 0.04, weight: 10 }
```

- `weight` controls spawn probability relative to other objects.
- `rare: true` is a convenience flag for high-value bonus objects (combine
  with a low `weight`).

Hazards work the same way, plus a `penalty`:
- `"gameover"` — instant game over
- `"loseLife"` — costs one life (only if `lives > 0`)
- a negative number — direct point penalty

### Game modes

Set `gameMode` to `"classic"`, `"timeAttack"`, `"kids"`, or `"challenge"`.
- **kids**: disables hazards and slows objects via the `kidsMode` block.
- **challenge**: the game ends as soon as `challengeTargetScore` is reached.

### Difficulty

`difficulty.level` selects one of the `easy`/`medium`/`hard` presets, or use
`"custom"` to fully control `spawnIntervalMs`, `objectSpeed`, `maxOnScreen`,
and `hazardChance`.

### Rewards & sharing

`rewards.thresholds` maps minimum scores to a message/badge shown on the end
screen. `showQrCode` renders a lightweight canvas-based QR-like code (swap in
a real QR library for production scanning) encoding the score + coupon code.
`shareText` supports `{score}` and `{gameName}` placeholders and uses the
native Web Share API when available.

### Leaderboard integration

Set `leaderboard.enabled = true` and either:
- provide `submitUrl` to `POST` a JSON payload (`user`, `event`, `score`,
  `game`, `timestamp`), or
- provide an `onSubmit(payload)` function to handle it yourself (e.g. hand
  off to a FanForge admin panel integration).

## Project structure

```
index.html            Game shell (canvas + screens)
src/
├── gameEngine.js      Core loop: spawning, physics tick, collisions, render
├── physics.js         Gravity/velocity model (PhysicsBody, launchVelocity)
├── collision.js       Segment-vs-circle slice detection
├── particles.js       Slice splatter + floating score popups
├── scoring.js         Combo-aware scoring system
├── inputHandler.js    Mouse/touch swipe tracking
├── ui.js              DOM screens (start/HUD/end) driven by config
├── main.js            Wiring (organizers should not need to edit this)
├── style.css          Theme variables consumed from gameConfig at runtime
└── config/
    ├── gameConfig.js       ← the file organizers edit
    └── examples/
        ├── sportsEvent.js
        └── brandPromo.js
assets/
├── objects/           Custom object/hazard images go here
├── sounds/            slice.mp3, explosion.mp3, combo.mp3, music.mp3, gameover.mp3
└── themes/            Logos, badges, loading backgrounds
```

## Notes for FanForge admin panel integration

The engine is built so an admin UI can generate a `gameConfig` object (from
form inputs / uploaded images) and hand it to `main.js` at runtime — no code
changes required per event. Recommended next step: expose a small loader
that fetches a JSON version of this config per `eventId` before
`GameEngine` is constructed.
