import { hash, smoothstep } from '../core/math.ts';
import type { FrameState, Viewport } from '../types.ts';

// Fixed seeds, shared simulation time, no particles or timers created per frame.
const drops = Array.from({ length: 24 }, (_, i) => ({
  x: hash(i + 1801), phase: hash(i + 2909),
  speed: 19 + hash(i + 3911) * 19,
  length: 12 + hash(i + 4933) * 19,
  opacity: 0.12 + hash(i + 5953) * 0.12,
}));

/** A sparse veil of rain in the opening room, fading before entering its screen. */
export function drawOpeningRain(ctx: CanvasRenderingContext2D, viewport: Viewport, state: FrameState): void {
  const strength = 1 - smoothstep(0.10, 0.95, state.depth);
  if (strength <= 0) return;
  const { width, height, dpr } = viewport;
  const count = Math.max(8, Math.min(drops.length, Math.round(width / 70)));
  const travel = height + 100;
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const drop = drops[i]!;
    const y = (state.time * drop.speed + drop.phase * travel) % travel - 50;
    const x = drop.x * width + Math.sin(state.time * 0.09 + i) * 2;
    // Wrapping happens outside the visible frame, with zero opacity at either end.
    const edge = smoothstep(-30, 45, y) * (1 - smoothstep(height - 45, height + 35, y));
    // Leave the central television and the text at the corners visually quiet.
    const side = smoothstep(width * 0.15, width * 0.35, Math.abs(x - width * 0.5));
    const opacity = strength * edge * drop.opacity * (0.30 + side * 0.70);
    ctx.strokeStyle = `rgba(82,76,60,${opacity})`; ctx.lineWidth = 0.65;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2.5, y + drop.length); ctx.stroke();
    ctx.strokeStyle = `rgba(255,251,229,${opacity * 1.5})`; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(x + 0.8, y + 2); ctx.lineTo(x - 1.7, y + drop.length); ctx.stroke();
    if (i % 5 === 0) {
      ctx.fillStyle = `rgba(242,237,213,${opacity * 0.8})`;
      ctx.beginPath(); ctx.ellipse(x - 2, y + drop.length, 0.7, 1.6, 0.12, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}
