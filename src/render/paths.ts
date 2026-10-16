/** All geometry is in screen-centered coordinates, shared by every recursive layer. */
export function glassPath(): Path2D {
  const p = new Path2D();
  p.moveTo(0, -0.3);
  p.bezierCurveTo(0.20, -0.3, 0.335, -0.295, 0.376, -0.274);
  p.bezierCurveTo(0.411, -0.254, 0.418, -0.15, 0.418, 0);
  p.bezierCurveTo(0.418, 0.15, 0.411, 0.254, 0.376, 0.274);
  p.bezierCurveTo(0.335, 0.295, 0.20, 0.3, 0, 0.3);
  p.bezierCurveTo(-0.20, 0.3, -0.335, 0.295, -0.376, 0.274);
  p.bezierCurveTo(-0.411, 0.254, -0.418, 0.15, -0.418, 0);
  p.bezierCurveTo(-0.418, -0.15, -0.411, -0.254, -0.376, -0.274);
  p.bezierCurveTo(-0.335, -0.295, -0.20, -0.3, 0, -0.3);
  p.closePath();
  return p;
}

export function roundedPath(x: number, y: number, w: number, h: number, radius: number): Path2D {
  const r = Math.min(radius, w / 2, h / 2);
  const p = new Path2D();
  p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r);
  p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r);
  p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y); p.closePath();
  return p;
}
