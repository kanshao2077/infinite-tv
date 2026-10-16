import { hash, smoothstep } from '../core/math.ts';
import { roundedPath } from './paths.ts';

const shell = roundedPath(-0.5, -0.38, 1.14, 0.8, 0.057);
const side = roundedPath(-0.487, -0.367, 1.143, 0.807, 0.058);
const front = roundedPath(-0.491, -0.372, 1.115, 0.779, 0.049);
const bezel = roundedPath(-0.462, -0.343, 0.924, 0.687, 0.081);
const panel = roundedPath(0.482, -0.333, 0.115, 0.665, 0.014);

function knob(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  ctx.fillStyle = '#69675e'; ctx.beginPath(); ctx.ellipse(x + 0.005, y + 0.006, radius + 0.003, radius + 0.003, 0, 0, Math.PI * 2); ctx.fill();
  const metal = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
  metal.addColorStop(0, '#f0ebdc'); metal.addColorStop(0.25, '#9d9b91'); metal.addColorStop(0.53, '#d4d0c3'); metal.addColorStop(1, '#56564e');
  ctx.fillStyle = metal; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  const center = ctx.createRadialGradient(x - 0.008, y - 0.01, 0, x, y, radius * 0.82);
  center.addColorStop(0, '#43453f'); center.addColorStop(1, '#20231f');
  ctx.fillStyle = center; ctx.beginPath(); ctx.arc(x, y, radius * 0.77, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c6c3b3'; ctx.lineWidth = 0.0022;
  ctx.beginPath(); ctx.moveTo(x + 0.004, y - radius * 0.65); ctx.lineTo(x + 0.008, y - radius * 0.25); ctx.stroke();
}

/** Vector chassis remains sharp as its closest edges grow beyond the viewport. */
export function drawTelevision(ctx: CanvasRenderingContext2D, scale: number): void {
  ctx.fillStyle = '#262721'; ctx.fill(side);
  const casing = ctx.createLinearGradient(-0.44, -0.38, 0.47, 0.43);
  casing.addColorStop(0, '#e5e0d1'); casing.addColorStop(0.18, '#bfbdae'); casing.addColorStop(0.62, '#a9aa9a'); casing.addColorStop(0.89, '#959989'); casing.addColorStop(1, '#666f62');
  ctx.fillStyle = casing; ctx.fill(shell);
  ctx.strokeStyle = 'rgba(242,237,219,.5)'; ctx.lineWidth = 0.0023; ctx.stroke(front);
  const bevel = ctx.createLinearGradient(0, -0.343, 0, 0.344);
  bevel.addColorStop(0, '#656c60'); bevel.addColorStop(0.05, '#262e27'); bevel.addColorStop(0.6, '#141c17'); bevel.addColorStop(0.96, '#333d32'); bevel.addColorStop(1, '#d4d4bf');
  ctx.fillStyle = bevel; ctx.fill(bezel);
  ctx.strokeStyle = 'rgba(12,18,12,.62)'; ctx.lineWidth = 0.004; ctx.stroke(bezel);
  ctx.fillStyle = 'rgba(20,27,20,.11)'; ctx.fill(panel);
  ctx.strokeStyle = 'rgba(237,234,215,.28)'; ctx.lineWidth = 0.001; ctx.stroke(panel);

  if (scale < 28) return;
  const detail = smoothstep(28, 80, scale);
  ctx.save(); ctx.globalAlpha *= detail;
  knob(ctx, 0.539, -0.225, 0.039);
  knob(ctx, 0.539, -0.105, 0.031);
  ctx.strokeStyle = 'rgba(40,48,38,.55)'; ctx.lineWidth = 0.0018;
  for (let y = 0.012; y < 0.235; y += 0.012) {
    ctx.beginPath(); ctx.moveTo(0.504, y); ctx.lineTo(0.574, y); ctx.stroke();
    ctx.strokeStyle = 'rgba(229,226,207,.18)'; ctx.beginPath(); ctx.moveTo(0.504, y + 0.002); ctx.lineTo(0.574, y + 0.002); ctx.stroke();
    ctx.strokeStyle = 'rgba(40,48,38,.55)';
  }
  ctx.fillStyle = '#362722'; ctx.beginPath(); ctx.arc(0.539, 0.283, 0.008, 0, Math.PI * 2); ctx.fill();
  const diode = ctx.createRadialGradient(0.538, 0.281, 0, 0.539, 0.283, 0.006);
  diode.addColorStop(0, '#c06a4b'); diode.addColorStop(0.4, '#9b252b'); diode.addColorStop(1, '#5c1c22');
  ctx.fillStyle = diode; ctx.beginPath(); ctx.arc(0.539, 0.283, 0.0056, 0, Math.PI * 2); ctx.fill();
  ctx.font = '0.0105px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#555e4f';
  ctx.fillText('UHF', 0.539, -0.282); ctx.fillText('VHF', 0.539, -0.153); ctx.fillText('POWER', 0.539, 0.313);

  ctx.textAlign = 'left'; ctx.font = '0.012px monospace'; ctx.fillStyle = '#3e4b3c'; ctx.fillText('INFINITE', -0.406, 0.377);
  ctx.font = '0.0085px monospace'; ctx.fillStyle = '#626e5b'; ctx.fillText('SOLID STATE', -0.406, 0.391);
  ctx.textAlign = 'right'; ctx.font = '0.009px monospace'; ctx.fillText('MODEL  ∞ / 84', 0.423, 0.383);
  ctx.strokeStyle = 'rgba(36,43,34,.25)'; ctx.lineWidth = 0.0008;
  for (const [x, y] of [[-0.472, -0.349], [0.61, -0.349], [-0.472, 0.387], [0.61, 0.387]]) {
    ctx.fillStyle = '#8a9180'; ctx.beginPath(); ctx.arc(x, y, 0.004, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 0.002, y - 0.001); ctx.lineTo(x + 0.002, y + 0.001); ctx.stroke();
  }
  // One shared, deterministic wear pattern; no new texture allocation per layer.
  ctx.strokeStyle = 'rgba(52,63,46,.13)'; ctx.lineWidth = 0.00065;
  for (let i = 0; i < 24; i++) {
    const x = -0.46 + hash(i + 9) * 0.85;
    const y = i % 2 ? -0.36 : 0.36 + hash(i + 40) * 0.035;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + hash(i + 70) * 0.017, y + 0.001); ctx.stroke();
  }
  ctx.restore();
}
