export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export function smoothstep(min: number, max: number, value: number): number {
  const t = clamp((value - min) / (max - min), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Stable per-layer variation, without a growing map of previously visited layers. */
export function hash(value: number): number {
  let n = Math.imul(value ^ 0x45d9f3b, 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
