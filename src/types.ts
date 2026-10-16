export interface FrameState {
  readonly depth: number;
  readonly time: number;
  readonly speed: number;
  readonly targetSpeed: number;
  readonly paused: boolean;
}

export interface Viewport {
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
  readonly baseScale: number;
  readonly focusX: number;
  readonly focusY: number;
}

export interface Layer {
  readonly id: number;
  readonly scale: number;
  readonly coverage: number;
  readonly presence: number;
  readonly opacity: number;
}

export interface ArtworkRenderer {
  render(state: FrameState): void;
  resize(viewport: Viewport): void;
  dispose(): void;
}

export interface Commands {
  adjustSpeed(delta: number): void;
  togglePause(): void;
  reset(): void;
}
