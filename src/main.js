/**
 * main.js — wires config + engine + UI together. Organizers should not
 * need to edit this file; all customization happens in
 * src/config/gameConfig.js.
 */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("game-root");
  const canvas = document.getElementById("game-canvas");
  const ui = new UIManager(gameConfig, root);

  let engine = null;

  ui.els.playBtn.addEventListener("click", () => {
    if (!engine) engine = new GameEngine(gameConfig, canvas, ui);
    engine.start();
  });

  ui.els.replayBtn.addEventListener("click", () => {
    engine.start();
  });

  ui.els.shareBtn.addEventListener("click", async () => {
    const score = engine ? engine.scoring.score : 0;
    const text = (gameConfig.rewards.shareText || "I scored {score} in {gameName}!")
      .replace("{score}", score)
      .replace("{gameName}", gameConfig.gameName);

    if (navigator.share) {
      try {
        await navigator.share({ title: gameConfig.gameName, text });
      } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard: " + text);
      } catch (e) {
        alert(text);
      }
    }
  });

  ui.showStart();
});
