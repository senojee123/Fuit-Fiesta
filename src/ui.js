/**
 * ui.js — DOM-based screens (start/end/HUD) driven entirely by gameConfig.
 * Kept separate from canvas rendering so organizers can restyle via CSS
 * without touching game logic.
 */

class UIManager {
  constructor(config, root) {
    this.config = config;
    this.root = root;
    this.els = {
      startScreen: root.querySelector("#start-screen"),
      endScreen: root.querySelector("#end-screen"),
      hud: root.querySelector("#hud"),
      score: root.querySelector("#hud-score"),
      timer: root.querySelector("#hud-timer"),
      lives: root.querySelector("#hud-lives"),
      combo: root.querySelector("#hud-combo"),
      gameTitle: root.querySelector("#game-title"),
      orgName: root.querySelector("#org-name"),
      logo: root.querySelector("#game-logo"),
      playBtn: root.querySelector("#play-btn"),
      replayBtn: root.querySelector("#replay-btn"),
      shareBtn: root.querySelector("#share-btn"),
      finalScore: root.querySelector("#final-score"),
      rewardMessage: root.querySelector("#reward-message"),
      rewardBadge: root.querySelector("#reward-badge"),
      qrWrap: root.querySelector("#qr-wrap"),
      couponCode: root.querySelector("#coupon-code"),
      canvas: root.querySelector("#game-canvas"),
    };
    this._applyBranding();
  }

  _applyBranding() {
    const { gameName, organizationName, theme } = this.config;
    document.title = gameName;
    this.els.gameTitle.textContent = gameName;
    this.els.orgName.textContent = organizationName;

    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--primary-color", theme.primaryColor);
    rootStyle.setProperty("--secondary-color", theme.secondaryColor);
    rootStyle.setProperty("--text-color", theme.textColor);
    rootStyle.setProperty("--panel-color", theme.uiPanelColor);
    rootStyle.setProperty("--font-family", theme.fontFamily);
    rootStyle.setProperty(
      "--bg-gradient",
      theme.backgroundGradient
        ? `linear-gradient(180deg, ${theme.backgroundGradient[0]}, ${theme.backgroundGradient[1]})`
        : theme.background
    );

    if (theme.logo) {
      this.els.logo.src = theme.logo;
      this.els.logo.style.display = "block";
    } else {
      this.els.logo.style.display = "none";
    }
  }

  showStart() {
    this.els.startScreen.classList.remove("hidden");
    this.els.endScreen.classList.add("hidden");
    this.els.hud.classList.add("hidden");
  }

  showGame() {
    this.els.startScreen.classList.add("hidden");
    this.els.endScreen.classList.add("hidden");
    this.els.hud.classList.remove("hidden");
  }

  showEnd({ score, message, badge }) {
    this.els.hud.classList.add("hidden");
    this.els.endScreen.classList.remove("hidden");
    this.els.finalScore.textContent = score;
    this.els.rewardMessage.textContent = message;

    if (badge) {
      this.els.rewardBadge.src = badge;
      this.els.rewardBadge.style.display = "block";
    } else {
      this.els.rewardBadge.style.display = "none";
    }

    const { rewards } = this.config;
    if (rewards.showQrCode) {
      this._renderQr(`Score:${score}|Coupon:${rewards.couponCode || ""}`);
      this.els.qrWrap.classList.remove("hidden");
    } else {
      this.els.qrWrap.classList.add("hidden");
    }
    if (rewards.couponCode) {
      this.els.couponCode.textContent = rewards.couponCode;
      this.els.couponCode.classList.remove("hidden");
    }
  }

  /** Minimal dependency-free QR-ish placeholder: renders a deterministic
   * pattern from the payload so no external QR library is required.
   * Swap with a real QR lib in production if scannability is required. */
  _renderQr(payload) {
    const canvas = this.els.qrWrap.querySelector("canvas") || document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 120;
    this.els.qrWrap.innerHTML = "";
    this.els.qrWrap.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 120, 120);
    ctx.fillStyle = "#000";
    let seed = 0;
    for (let i = 0; i < payload.length; i++) seed = (seed * 31 + payload.charCodeAt(i)) >>> 0;
    const cells = 10;
    const cellSize = 120 / cells;
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        seed = (seed * 1103515245 + 12345) >>> 0;
        if ((seed >> 16) % 2 === 0) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  updateScore(score) {
    this.els.score.textContent = score;
  }

  updateTimer(seconds) {
    this.els.timer.textContent = seconds > 0 || this.config.gameDuration === 0 ? seconds : 0;
  }

  updateLives(lives) {
    if (this.config.lives === 0) {
      this.els.lives.textContent = "∞";
      return;
    }
    this.els.lives.textContent = "❤".repeat(Math.max(lives, 0)) + "🖤".repeat(Math.max(this.config.lives - lives, 0));
  }

  updateCombo(combo, active) {
    if (combo > 1) {
      this.els.combo.textContent = `x${combo} COMBO!`;
      this.els.combo.classList.toggle("combo-active", active);
      this.els.combo.classList.remove("hidden");
    } else {
      this.els.combo.classList.add("hidden");
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = UIManager;
}
