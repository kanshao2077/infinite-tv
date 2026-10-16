import { hash, smoothstep } from '../core/math.ts';
import type { FrameState, Layer } from '../types.ts';

/** Each 30 s slot has one short, smooth event with a stable seed; pauses freeze it. */
export function signalAnomaly(time: number, layerId: number): number {
  const slot = Math.floor(time / 30);
  const eventTime = slot * 30 + 10 + hash(slot + 113) * 10;
  const duration = 0.12 + hash(slot + 317) * 0.08;
  const progress = (time - eventTime) / duration;
  return progress > 0 && progress < 1 ? Math.sin(progress * Math.PI) * (0.55 + hash(layerId) * 0.45) : 0;
}

export class SignalEffects {
  private readonly noise: HTMLCanvasElement;
  private readonly grille: HTMLCanvasElement;
  private readonly scans: HTMLCanvasElement;
  private readonly noisePattern: CanvasPattern | null;
  private readonly grillePattern: CanvasPattern | null;
  private readonly scanPattern: CanvasPattern | null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.noise = document.createElement('canvas'); this.noise.width = 128; this.noise.height = 128;
    const noiseContext = this.noise.getContext('2d')!;
    const data = noiseContext.createImageData(128, 128);
    for (let i = 0; i < 128 * 128; i++) {
      const value = Math.floor(hash(i + 711) * 255);
      data.data.set([value, value, value, 255], i * 4);
    }
    noiseContext.putImageData(data, 0, 0);
    this.noisePattern = ctx.createPattern(this.noise, 'repeat');
    this.grille = document.createElement('canvas'); this.grille.width = 3; this.grille.height = 3;
    const grilleContext = this.grille.getContext('2d')!;
    ['#c3a29a', '#afb8a0', '#a1b1b7'].forEach((color, i) => { grilleContext.fillStyle = color; grilleContext.fillRect(i, 0, 1, 3); });
    this.grillePattern = ctx.createPattern(this.grille, 'repeat');
    this.scans = document.createElement('canvas'); this.scans.width = 1; this.scans.height = 3;
    const scanContext = this.scans.getContext('2d')!;
    scanContext.fillStyle = 'rgba(0,0,0,.13)'; scanContext.fillRect(0, 0, 1, 0.7);
    this.scanPattern = ctx.createPattern(this.scans, 'repeat');
  }

  drawBackground(ctx: CanvasRenderingContext2D, layer: Layer, state: FrameState): void {
    const { presence, id } = layer;
    ctx.save(); ctx.globalAlpha *= presence;
    const phosphor = ctx.createRadialGradient(-0.05, -0.04, 0.02, 0, 0, 0.51);
    phosphor.addColorStop(0, 'rgba(124,139,112,.048)'); phosphor.addColorStop(0.65, 'rgba(89,113,94,.022)'); phosphor.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = phosphor; ctx.fillRect(-0.43, -0.31, 0.86, 0.62);
    if (layer.scale > 100) {
      ctx.strokeStyle = 'rgba(173,185,157,.07)'; ctx.lineWidth = 0.00075;
      for (let row = 0; row < 5; row++) {
        ctx.beginPath();
        for (let j = 0; j <= 64; j++) {
          const x = -0.4 + j / 80;
          const y = 0.18 + row * 0.012 + Math.sin(x * 17 + state.time * 0.18 + id * 0.7) * 0.006;
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawGlass(ctx: CanvasRenderingContext2D, layer: Layer, state: FrameState): void {
    const { scale, presence, id } = layer;
    ctx.save(); ctx.globalAlpha *= presence;
    const vignette = ctx.createRadialGradient(0, -0.025, 0.1, 0, 0, 0.47);
    vignette.addColorStop(0, 'rgba(18,35,49,.015)'); vignette.addColorStop(0.68, 'rgba(12,23,35,.055)'); vignette.addColorStop(1, 'rgba(0,0,0,.50)');
    ctx.fillStyle = vignette; ctx.fillRect(-0.43, -0.31, 0.86, 0.62);

    const reflection = ctx.createLinearGradient(-0.27, -0.3, 0.1, 0.15);
    reflection.addColorStop(0, 'rgba(199,224,245,.12)'); reflection.addColorStop(0.27, 'rgba(204,222,242,.035)'); reflection.addColorStop(0.55, 'rgba(220,228,245,0)');
    ctx.fillStyle = reflection; ctx.beginPath(); ctx.moveTo(-0.4, -0.3); ctx.lineTo(0.2, -0.3); ctx.lineTo(-0.24, 0.18); ctx.lineTo(-0.42, 0.14); ctx.closePath(); ctx.fill();

    // Raster patterns live in projected pixel coordinates, avoiding scale-dependent aliasing.
    const detail = smoothstep(90, 260, scale);
    if (detail > 0) {
      ctx.save(); ctx.scale(1 / scale, 1 / scale);
      if (this.noisePattern) {
        ctx.save(); ctx.globalAlpha *= 0.025 * detail;
        const step = Math.floor(state.time * 12);
        const offsetX = Math.floor(hash(step + id * 17) * 128);
        const offsetY = Math.floor(hash(step + id * 31 + 4) * 128);
        ctx.translate(offsetX, offsetY); ctx.fillStyle = this.noisePattern;
        ctx.fillRect(-scale * 0.43 - offsetX, -scale * 0.31 - offsetY, scale * 0.86, scale * 0.62); ctx.restore();
      }
      if (this.scanPattern) {
        ctx.save(); ctx.globalAlpha *= detail; ctx.fillStyle = this.scanPattern;
        ctx.fillRect(-scale * 0.43, -scale * 0.31, scale * 0.86, scale * 0.62); ctx.restore();
      }
      if (this.grillePattern) {
        ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha *= 0.018 * detail;
        ctx.fillStyle = this.grillePattern; ctx.fillRect(-scale * 0.43, -scale * 0.31, scale * 0.86, scale * 0.62); ctx.restore();
      }
      ctx.restore();
    }

    if (scale > 100) {
      ctx.save(); ctx.globalAlpha *= smoothstep(100, 240, scale) * 0.65;
      ctx.font = '0.015px monospace'; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      const year = String(1999 - (id % 6));
      // A restrained warm fringe on emissive text, not on the casing or page UI.
      ctx.fillStyle = 'rgba(155,65,54,.24)'; ctx.fillText(year, -0.346 + 0.55 / scale, -0.249);
      ctx.fillStyle = '#d5c7a8'; ctx.fillText(year, -0.346, -0.249);
      ctx.textAlign = 'right'; ctx.font = '0.010px monospace';
      ctx.fillText(`CH ${String(id % 99 + 1).padStart(2, '0')}`, 0.344, -0.245);
      ctx.restore();
    }
    const anomaly = signalAnomaly(state.time, id);
    if (anomaly > 0 && scale > 100) {
      const y = 0.11 + hash(id) * 0.07;
      ctx.fillStyle = `rgba(177,188,156,${anomaly * 0.018})`; ctx.fillRect(-0.42, y - 0.004, 0.84, 0.009);
      ctx.fillStyle = `rgba(177,188,156,${anomaly * 0.08})`; ctx.fillRect(-0.42, y, 0.84, 0.0015);
    }
    ctx.restore();
  }

  dispose(): void { this.noise.width = this.noise.height = this.grille.width = this.grille.height = this.scans.width = this.scans.height = 1; }
}
