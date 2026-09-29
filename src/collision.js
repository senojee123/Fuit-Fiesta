/**
 * collision.js — segment-vs-circle intersection for slice detection.
 */

/**
 * Returns true if the line segment (x1,y1)-(x2,y2) passes within `radius`
 * of point (cx, cy).
 */
function segmentIntersectsCircle(x1, y1, x2, y2, cx, cy, radius) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    const dist = Math.hypot(x1 - cx, y1 - cy);
    return dist <= radius;
  }

  // Project circle center onto the segment, clamped to [0,1]
  let t = ((cx - x1) * dx + (cy - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;
  const dist = Math.hypot(closestX - cx, closestY - cy);
  return dist <= radius;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { segmentIntersectsCircle };
}
