import type { Layer, Viewport } from '../types.ts';
import { smoothstep } from './math.ts';

export const RECURSION_RATIO = 0.42;
export const BODY_WIDTH = 1.30;
const LOG_RATIO = Math.log(RECURSION_RATIO);
const PIXEL_BUDGET = 6_000_000;

export function makeViewport(width: number, height: number, deviceDpr: number): Viewport {
  width = Math.max(1, width); height = Math.max(1, height);
  const baseScale = Math.min(720 / BODY_WIDTH, width * (width < 680 ? 0.86 : 0.70) / BODY_WIDTH, height * 0.78 / 1.65);
  return {
    width, height,
    dpr: Math.min(Math.max(1, deviceDpr || 1), 2, Math.sqrt(PIXEL_BUDGET / (width * height))),
    baseScale,
    // The shell is asymmetric, but the glass and every descendant share this fixed anchor.
    focusX: width / 2 - baseScale * 0.17,
    focusY: height * 0.57,
  };
}

export function layerScale(id: number, depth: number, baseScale: number): number {
  return baseScale * Math.exp(LOG_RATIO * (id - depth));
}

export function visibleLayers(depth: number, viewport: Viewport): Layer[] {
  if (!Number.isFinite(depth) || depth < 0) return [];
  const { width, height, focusX, focusY, baseScale } = viewport;
  const extentX = Math.max(focusX, width - focusX);
  const extentY = Math.max(focusY, height - focusY);
  // An inscribed rectangle is strictly inside the curved glass. At coverage >= 2,
  // both the shell and all screen-wide effects have zero visible contribution.
  const maxScale = Math.max(2 * extentX / 0.30, 2 * extentY / 0.22);
  const first = Math.max(0, Math.floor(depth + Math.log(maxScale / baseScale) / LOG_RATIO));
  const layers: Layer[] = [];
  for (let id = first; layers.length < 32; id++) {
    const scale = layerScale(id, depth, baseScale);
    const pixelWidth = scale * BODY_WIDTH;
    if (pixelWidth <= 0.5) break;
    const coverage = Math.min(0.30 * scale / extentX, 0.22 * scale / extentY);
    if (coverage >= 2) continue;
    layers.push({ id, scale, coverage, presence: 1 - smoothstep(1.05, 2, coverage), opacity: smoothstep(0.5, 2.5, pixelWidth) });
  }
  return layers;
}
