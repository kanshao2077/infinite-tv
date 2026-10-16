import './style.css';
import { AnimationEngine } from './core/engine.ts';
import { makeViewport } from './core/geometry.ts';
import { CanvasRenderer } from './render/canvas-renderer.ts';
import { RoomScene } from './render/room-scene.ts';
import { bindControls } from './input/controls.ts';
import { bindCuratorial } from './ui/curatorial.ts';
import type { Commands, FrameState } from './types.ts';

const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const artwork = document.querySelector<HTMLElement>('#artwork')!;
const pauseButton = document.querySelector<HTMLButtonElement>('#pause')!;
const pauseLabel = document.querySelector<HTMLElement>('#pause-label')!;
const pauseSymbol = document.querySelector<HTMLElement>('#pause-symbol')!;
const transmissionLabel = document.querySelector<HTMLElement>('#transmission-label')!;
const layerOutput = document.querySelector<HTMLOutputElement>('#layer')!;
const progress = document.querySelector<HTMLElement>('#layer-progress')!;
const speedOutput = document.querySelector<HTMLElement>('#speed')!;
const announcement = document.querySelector<HTMLElement>('#announcement')!;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

// Local development fixtures allow repeatable visual checks; production ignores these.
const fixture = import.meta.env.DEV ? new URLSearchParams(location.search) : new URLSearchParams();
const fixtureDepth = Number(fixture.get('frameDepth') ?? 0);
const fixtureTime = Number(fixture.get('frameTime') ?? 0);
const engine = new AnimationEngine(motionPreference.matches || fixture.get('still') === '1', {
  depth: Number.isFinite(fixtureDepth) ? Math.max(0, fixtureDepth) : 0,
  time: Number.isFinite(fixtureTime) ? Math.max(0, fixtureTime) : 0,
});
const measure = () => { const rect = artwork.getBoundingClientRect(); return makeViewport(rect.width, rect.height, window.devicePixelRatio); };

let renderer: CanvasRenderer;
try { renderer = new CanvasRenderer(canvas, measure(), await RoomScene.load()); }
catch (error) {
  document.querySelector<HTMLElement>('#loading-note')!.hidden = true;
  artwork.removeAttribute('aria-busy');
  document.querySelector<HTMLElement>('#fallback')!.hidden = false;
  console.error(error); throw error;
}
document.querySelector<HTMLElement>('#loading-note')!.hidden = true;
artwork.removeAttribute('aria-busy');

let raf: number | null = null;
let disposed = false;
let lastHudUpdate = -Infinity;
let previousPaused: boolean | null = null;
let needsResize = false;
let dpr = window.devicePixelRatio;
const lifecycle = new AbortController();
const statistics = { started: 0, count: 0, cost: 0, frames: 0 };

function updateHud(state: FrameState, timestamp: number, force = false): void {
  if (!force && timestamp - lastHudUpdate < 80 && state.paused === previousPaused) return;
  lastHudUpdate = timestamp;
  layerOutput.value = String(Math.floor(state.depth) + 1).padStart(4, '0');
  progress.style.transform = `scaleX(${state.depth - Math.floor(state.depth)})`;
  speedOutput.textContent = `${(state.paused ? state.targetSpeed : state.speed).toFixed(1)}×`;
  if (state.paused !== previousPaused) {
    artwork.dataset.paused = String(state.paused);
    pauseButton.setAttribute('aria-pressed', String(state.paused));
    pauseButton.setAttribute('aria-label', state.paused ? '继续动画' : '暂停动画');
    pauseLabel.textContent = state.paused ? 'RESUME' : 'PAUSE';
    pauseSymbol.textContent = state.paused ? '▷' : 'Ⅱ';
    transmissionLabel.textContent = state.paused ? 'SIGNAL HELD' : 'TRANSMITTING';
    if (previousPaused !== null) announcement.textContent = state.paused ? '动画已暂停' : '动画继续播放';
    previousPaused = state.paused;
  }
}

function requestFrame(): void {
  if (raf === null && !disposed && !document.hidden) raf = requestAnimationFrame(frame);
}

function frame(timestamp: number): void {
  raf = null;
  if (disposed || document.hidden) return;
  if (needsResize || dpr !== window.devicePixelRatio) {
    needsResize = false; dpr = window.devicePixelRatio; renderer.resize(measure());
  }
  const state = engine.tick(timestamp);
  const renderStart = import.meta.env.DEV ? performance.now() : 0;
  renderer.render(state); updateHud(state, timestamp);
  if (import.meta.env.DEV && !state.paused) {
    if (!statistics.started) statistics.started = timestamp;
    statistics.count++; statistics.frames++; statistics.cost += performance.now() - renderStart;
    canvas.dataset.renderedFrames = String(statistics.frames);
    if (timestamp - statistics.started >= 1000) {
      canvas.dataset.observedFps = ((statistics.count - 1) * 1000 / (timestamp - statistics.started)).toFixed(1);
      canvas.dataset.renderMs = (statistics.cost / statistics.count).toFixed(2);
      statistics.started = timestamp; statistics.count = 1; statistics.cost = 0;
    }
  } else statistics.started = statistics.count = statistics.cost = 0;
  if (!state.paused) requestFrame();
}

const commands: Commands = {
  adjustSpeed(delta) { engine.adjustSpeed(delta); updateHud(engine.state, performance.now(), true); requestFrame(); },
  togglePause() { engine.togglePause(); updateHud(engine.state, performance.now(), true); requestFrame(); },
  reset() { engine.reset(); updateHud(engine.state, performance.now(), true); announcement.textContent = '已回到第一层'; requestFrame(); },
};
const unbindControls = bindControls(canvas, commands);
const unbindCuratorial = bindCuratorial(commands, () => engine.state);
pauseButton.addEventListener('click', commands.togglePause, { signal: lifecycle.signal });
document.querySelector<HTMLButtonElement>('#reset')!.addEventListener('click', commands.reset, { signal: lifecycle.signal });

function resize(): void { needsResize = true; requestFrame(); }
const observer = new ResizeObserver(resize); observer.observe(artwork);
window.addEventListener('resize', resize, { signal: lifecycle.signal });
window.visualViewport?.addEventListener('resize', resize, { signal: lifecycle.signal });
document.addEventListener('visibilitychange', () => {
  engine.resetClock();
  statistics.started = statistics.count = statistics.cost = 0;
  if (document.hidden) { if (raf !== null) cancelAnimationFrame(raf); raf = null; }
  else requestFrame();
}, { signal: lifecycle.signal });
window.addEventListener('pagehide', () => { engine.resetClock(); if (raf !== null) cancelAnimationFrame(raf); raf = null; }, { signal: lifecycle.signal });
window.addEventListener('pageshow', () => { engine.resetClock(); requestFrame(); }, { signal: lifecycle.signal });

function dispose(): void {
  disposed = true;
  if (raf !== null) cancelAnimationFrame(raf);
  observer.disconnect(); lifecycle.abort(); unbindControls(); unbindCuratorial(); renderer.dispose();
}
if (import.meta.hot) import.meta.hot.dispose(dispose);
updateHud(engine.state, 0, true); requestFrame();
