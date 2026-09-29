/**
 * inputHandler.js — tracks pointer/touch trail and reports slice segments.
 * Engine-agnostic: knows nothing about fruits, only about canvas coordinates
 * and line segments the player dragged through.
 */

class InputHandler {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {(segment: {x1:number,y1:number,x2:number,y2:number}) => void} onSlice
   */
  constructor(canvas, onSlice) {
    this.canvas = canvas;
    this.onSlice = onSlice;
    this.active = false;
    this.lastPoint = null;
    this.trail = []; // for rendering the slice trail

    this._bind();
  }

  _bind() {
    const c = this.canvas;
    c.addEventListener("mousedown", (e) => this._start(this._pos(e)));
    c.addEventListener("mousemove", (e) => this._move(this._pos(e)));
    window.addEventListener("mouseup", () => this._end());

    c.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this._start(this._pos(e.touches[0]));
    }, { passive: false });
    c.addEventListener("touchmove", (e) => {
      e.preventDefault();
      this._move(this._pos(e.touches[0]));
    }, { passive: false });
    c.addEventListener("touchend", (e) => {
      e.preventDefault();
      this._end();
    }, { passive: false });
  }

  _pos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  _start(p) {
    this.active = true;
    this.lastPoint = p;
    this.trail = [p];
  }

  _move(p) {
    if (!this.active || !this.lastPoint) return;
    const seg = { x1: this.lastPoint.x, y1: this.lastPoint.y, x2: p.x, y2: p.y };
    this.onSlice(seg);
    this.trail.push(p);
    if (this.trail.length > 12) this.trail.shift();
    this.lastPoint = p;
  }

  _end() {
    this.active = false;
    this.lastPoint = null;
    this.trail = [];
  }

  getTrail() {
    return this.trail;
  }
}

if (typeof module !== "undefined" && module.exports) module.exports = InputHandler;
