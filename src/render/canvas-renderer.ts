import type { ArtworkRenderer, FrameState, Layer, Viewport } from '../types.ts';
import { visibleLayers } from '../core/geometry.ts';
import { glassPath } from './paths.ts';
import { RoomScene } from './room-scene.ts';
import { SignalEffects, signalAnomaly } from '../effects/signal.ts';
import { drawOpeningRain } from '../effects/rain.ts';

export class CanvasRenderer implements ArtworkRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly glass = glassPath();
  private readonly effects: SignalEffects;
  private viewport: Viewport;
  private layers: Layer[] = [];

  constructor(private readonly canvas: HTMLCanvasElement, viewport: Viewport, private readonly room: RoomScene) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D is unavailable');
    this.ctx = ctx; this.viewport = viewport; this.effects = new SignalEffects(ctx); this.resize(viewport);
  }

  resize(viewport: Viewport): void {
    this.viewport = viewport;
    this.canvas.width = Math.max(1, Math.round(viewport.width * viewport.dpr));
    this.canvas.height = Math.max(1, Math.round(viewport.height * viewport.dpr));
    this.canvas.style.width = `${viewport.width}px`; this.canvas.style.height = `${viewport.height}px`;
  }

  render(state: FrameState): void {
    const { ctx, canvas, viewport } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#dfd5ca'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.layers = visibleLayers(state.depth, viewport);
    if (this.layers.length) this.drawLayer(0, state);
    if (import.meta.env.DEV) {
      canvas.dataset.visibleLayers = String(this.layers.length);
      canvas.dataset.firstLayer = String(this.layers[0]?.id ?? 0);
      canvas.dataset.depth = state.depth.toFixed(8);
      canvas.dataset.time = state.time.toFixed(8);
      canvas.dataset.paused = String(state.paused);
      canvas.dataset.speed = state.speed.toFixed(5);
      canvas.dataset.targetSpeed = state.targetSpeed.toFixed(5);
    }
  }

  private transform(layer: Layer, offset = 0): void {
    const { dpr, focusX, focusY } = this.viewport;
    this.ctx.setTransform(layer.scale * dpr, 0, 0, layer.scale * dpr, (focusX + offset) * dpr, focusY * dpr);
  }

  private drawLayer(index: number, state: FrameState, offset = 0): void {
    const layer = this.layers[index]; const ctx = this.ctx;
    ctx.save(); ctx.globalAlpha *= layer.opacity; this.transform(layer, offset);
    // Every screen contains the same room, redrawn from the shared plate rather than a previous frame.
    this.room.draw(ctx, layer, this.viewport, index > 0);
    if (layer.id === 0) drawOpeningRain(ctx, this.viewport, state);
    ctx.fillStyle = '#1b2428'; ctx.fill(this.glass);
    ctx.save(); ctx.clip(this.glass);
    this.effects.drawBackground(ctx, layer, state);
    if (index + 1 < this.layers.length) {
      const anomaly = signalAnomaly(state.time, layer.id);
      // A local, sub-pixel signal offset, never a camera displacement or periodic reset.
      this.drawLayer(index + 1, state, offset + anomaly * layer.presence * 0.7);
    }
    this.transform(layer, offset); this.effects.drawGlass(ctx, layer, state);
    ctx.restore();
    // Screen rim: keep it faint so recursion remains readable.
    this.transform(layer, offset); ctx.globalAlpha *= layer.presence;
    ctx.strokeStyle = 'rgba(206,218,230,.18)'; ctx.lineWidth = 0.0014; ctx.stroke(this.glass);
    ctx.restore();
  }

  dispose(): void { this.effects.dispose(); this.room.dispose(); this.canvas.width = this.canvas.height = 1; this.layers = []; }
}
