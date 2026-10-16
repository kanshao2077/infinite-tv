import referenceUrl from '../assets/memory-room.png';
import foregroundUrl from '../assets/television-foreground-aged.png';
import paperUrl from '../assets/diary-window.png';
import { hash, smoothstep } from '../core/math.ts';
import type { Layer, Viewport } from '../types.ts';
import { drawTelevision } from './television.ts';

/** Local photograph for inner rooms, transparent foreground for the opening room. */
export class RoomScene {
  private readonly plate: HTMLCanvasElement | null;
  private readonly grain: HTMLCanvasElement;
  private readonly paper: HTMLCanvasElement | null;
  private readonly patterns = new WeakMap<CanvasRenderingContext2D, CanvasPattern>();
  private readonly paperPatterns = new WeakMap<CanvasRenderingContext2D, CanvasPattern>();

  private constructor(image: HTMLImageElement | null, private readonly foreground: HTMLImageElement | null, paperImage: HTMLImageElement | null) {
    // Reuse the supplied template's blank paper as a material; no extra generated texture.
    this.paper = paperImage ? document.createElement('canvas') : null;
    if (this.paper && paperImage) {
      this.paper.width = this.paper.height = 600;
      this.paper.getContext('2d')!.drawImage(paperImage, 100, 200, 800, 800, 0, 0, 600, 600);
    }
    this.plate = image ? document.createElement('canvas') : null;
    if (this.plate && image) {
      this.plate.width = image.naturalWidth; this.plate.height = image.naturalHeight;
      const ctx = this.plate.getContext('2d')!;
      ctx.drawImage(image, 0, 0);
      // A broad fade in the empty wall, a narrow one around the actual television.
      // This preparation runs once, never in the animation loop.
      const pixels = ctx.getImageData(0, 0, this.plate.width, this.plate.height);
      for (let y = 0; y < this.plate.height; y++) {
        const body = smoothstep(435, 515, y) * (1 - smoothstep(1160, 1280, y));
        const feather = 36 + 200 * (1 - body);
        const vertical = smoothstep(0, 100, y) * (1 - smoothstep(1300, 1440, y));
        for (let x = 0; x < this.plate.width; x++) {
          const edge = smoothstep(0, feather, Math.min(x, this.plate.width - 1 - x));
          pixels.data[(y * this.plate.width + x) * 4 + 3] *= edge * vertical;
        }
      }
      ctx.putImageData(pixels, 0, 0);
    }
    this.grain = document.createElement('canvas'); this.grain.width = this.grain.height = 96;
    const ctx = this.grain.getContext('2d')!;
    const data = ctx.createImageData(96, 96);
    for (let i = 0; i < 96 * 96; i++) {
      const value = Math.floor(hash(i + 1421) * 255);
      data.data.set([value, value, value, 255], i * 4);
    }
    ctx.putImageData(data, 0, 0);
  }

  static async load(): Promise<RoomScene> {
    const loadImage = async (url: string): Promise<HTMLImageElement | null> => {
      const image = new Image(); image.decoding = 'async';
      try {
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve(); image.onerror = () => reject(new Error('Local artwork asset could not load'));
          image.src = url;
        });
        return image;
      } catch { return null; }
    };
    const [image, foreground, paper] = await Promise.all([loadImage(referenceUrl), loadImage(foregroundUrl), loadImage(paperUrl)]);
    return new RoomScene(image, foreground, paper);
  }

  draw(ctx: CanvasRenderingContext2D, layer: Layer, viewport: Viewport, nested: boolean): void {
    const extent = nested ? 1.12 : Math.max(viewport.width, viewport.height) / layer.scale + 1;
    const left = -extent; const right = extent; const top = -extent; const bottom = extent;
    const openingRoom = layer.id === 0 && this.foreground;
    const wall = ctx.createLinearGradient(0, -1.2, 0, 0.5);
    wall.addColorStop(0, openingRoom ? '#e9e1cd' : '#eee8ec');
    wall.addColorStop(0.6, openingRoom ? '#ddd1b9' : '#e5dce1');
    wall.addColorStop(1, openingRoom ? '#c9b79e' : '#cfc2bf');
    ctx.fillStyle = wall; ctx.fillRect(left, top, right - left, bottom - top);
    const daylight = ctx.createRadialGradient(-0.85, -1.1, 0.05, -0.3, -0.8, 1.8);
    daylight.addColorStop(0, 'rgba(251,246,241,.48)'); daylight.addColorStop(0.55, 'rgba(226,220,235,.10)'); daylight.addColorStop(1, 'rgba(114,83,73,.08)');
    ctx.fillStyle = daylight; ctx.fillRect(left, top, right - left, bottom - top);

    const wood = ctx.createLinearGradient(0, 0.40, 0, 0.72);
    wood.addColorStop(0, '#a48675'); wood.addColorStop(0.3, '#9f7b6c'); wood.addColorStop(1, '#806354');
    ctx.fillStyle = wood; ctx.fillRect(left, 0.40, right - left, Math.max(0, bottom - 0.40));
    ctx.fillStyle = '#684d3d'; ctx.fillRect(left, 0.68, right - left, 0.026);
    const cabinet = ctx.createLinearGradient(0, 0.70, 0, 1.5);
    cabinet.addColorStop(0, '#967663'); cabinet.addColorStop(1, '#79604f');
    ctx.fillStyle = cabinet; ctx.fillRect(left, 0.706, right - left, Math.max(0, bottom - 0.706));
    for (let x = Math.floor(left / 0.42) * 0.42; x < right; x += 0.42) {
      const panel = ctx.createLinearGradient(x, 0, x + 0.35, 0);
      panel.addColorStop(0, 'rgba(57,35,26,.26)'); panel.addColorStop(0.07, 'rgba(243,205,156,.12)');
      panel.addColorStop(0.8, 'rgba(80,46,30,0)'); panel.addColorStop(1, 'rgba(43,27,23,.3)');
      ctx.fillStyle = panel; ctx.fillRect(x, 0.76, 0.35, Math.max(0, bottom - 0.76));
    }

    // Use absolute identity: this treatment never swaps at an integer zoom boundary.
    if (openingRoom) {
      // A diffuse cast shadow and two contact shadows anchor the feet to the shared table.
      const shadow = (x: number, y: number, radius: number, flatness: number, opacity: number): void => {
        ctx.save(); ctx.translate(x, y); ctx.scale(1, flatness);
        const shade = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        shade.addColorStop(0, `rgba(46,30,23,${opacity})`); shade.addColorStop(1, 'rgba(46,30,23,0)');
        ctx.fillStyle = shade; ctx.fillRect(-radius, -radius, radius * 2, radius * 2); ctx.restore();
      };
      shadow(0.17, 0.447, 0.76, 0.13, 0.40);
      shadow(-0.30, 0.449, 0.12, 0.16, 0.50);
      shadow(0.64, 0.449, 0.12, 0.16, 0.50);
    }
    const artwork = openingRoom ? this.foreground : this.plate;
    if (artwork) {
      // Photograph screen center: (425,825). Units match the existing curved-glass path.
      const unit = 0.00133;
      ctx.drawImage(artwork, -425 * unit, -825 * unit, 1080 * unit, 1440 * unit);
    } else drawTelevision(ctx, layer.scale);

    if (openingRoom && this.paper) {
      let patina = this.paperPatterns.get(ctx);
      if (!patina) {
        patina = ctx.createPattern(this.paper, 'repeat') ?? undefined;
        if (patina) this.paperPatterns.set(ctx, patina);
      }
      if (patina) {
        ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha *= 0.56;
        // This texture moves with the physical room, without a periodic reset.
        ctx.scale(1 / 512, 1 / 512); ctx.fillStyle = patina;
        ctx.fillRect(left * 512, top * 512, (right - left) * 512, (bottom - top) * 512); ctx.restore();
      }
    }

    let pattern = this.patterns.get(ctx);
    if (!pattern) {
      pattern = ctx.createPattern(this.grain, 'repeat') ?? undefined;
      if (pattern) this.patterns.set(ctx, pattern);
    }
    if (pattern) {
      ctx.save(); ctx.scale(1 / layer.scale, 1 / layer.scale); ctx.globalAlpha *= 0.033;
      ctx.fillStyle = pattern; ctx.fillRect(left * layer.scale, top * layer.scale, (right - left) * layer.scale, (bottom - top) * layer.scale);
      ctx.restore();
    }
  }

  dispose(): void {
    if (this.plate) this.plate.width = this.plate.height = 1;
    if (this.paper) this.paper.width = this.paper.height = 1;
    this.grain.width = this.grain.height = 1;
  }
}
