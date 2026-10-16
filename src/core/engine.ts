import type { FrameState } from '../types.ts';
import { clamp } from './math.ts';

export const SECONDS_PER_LAYER = 15;
const SPEED_RESPONSE_SECONDS = 0.2;

export class AnimationEngine {
  private depth = 0;
  private time = 0;
  private speed = 1;
  private targetSpeed = 1;
  private paused: boolean;
  private lastTimestamp: number | null = null;

  constructor(paused = false, initial: { depth: number; time: number } = { depth: 0, time: 0 }) {
    this.paused = paused; this.depth = initial.depth; this.time = initial.time;
  }

  get state(): FrameState {
    return { depth: this.depth, time: this.time, speed: this.speed, targetSpeed: this.targetSpeed, paused: this.paused };
  }

  tick(timestamp: number): FrameState {
    if (this.lastTimestamp === null) { this.lastTimestamp = timestamp; return this.state; }
    const dt = clamp((timestamp - this.lastTimestamp) / 1000, 0, 0.05);
    this.lastTimestamp = timestamp;
    if (!this.paused) this.advance(dt);
    return this.state;
  }

  /** Closed-form exponential smoothing and its exact integral: refresh-rate independent. */
  private advance(dt: number): void {
    const decay = Math.exp(-dt / SPEED_RESPONSE_SECONDS);
    const difference = this.speed - this.targetSpeed;
    const distance = this.targetSpeed * dt + difference * SPEED_RESPONSE_SECONDS * (1 - decay);
    this.speed = this.targetSpeed + difference * decay;
    this.depth += distance / SECONDS_PER_LAYER;
    this.time += dt;
  }

  adjustSpeed(delta: number): void {
    if (!Number.isFinite(delta)) return;
    this.targetSpeed = clamp(this.targetSpeed * Math.exp(clamp(delta, -1, 1)), 0.1, 4);
  }

  togglePause(): void { this.paused = !this.paused; this.resetClock(); }
  resetClock(): void { this.lastTimestamp = null; }

  reset(): void {
    this.depth = 0; this.time = 0; this.speed = 1; this.targetSpeed = 1; this.paused = false;
    this.resetClock();
  }
}
