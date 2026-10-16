import type { Commands } from '../types.ts';

/** Input only emits commands; animation and rendering never run in event handlers. */
export function bindControls(canvas: HTMLCanvasElement, commands: Commands): () => void {
  const controller = new AbortController();
  const signal = controller.signal;
  let pointerId: number | null = null;
  let downX = 0; let downY = 0; let lastY = 0; let dragged = false;
  let multiTouch = false;

  canvas.addEventListener('wheel', event => {
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? canvas.clientHeight : 1;
    commands.adjustSpeed(-event.deltaY * unit * 0.0025);
  }, { passive: false, signal });

  canvas.addEventListener('pointerdown', event => {
    if (pointerId !== null) { multiTouch = true; dragged = true; return; }
    if (event.button !== 0) return;
    pointerId = event.pointerId; downX = event.clientX; downY = lastY = event.clientY;
    dragged = false; multiTouch = false;
    canvas.setPointerCapture(event.pointerId);
  }, { signal });

  canvas.addEventListener('pointermove', event => {
    if (event.pointerId !== pointerId || multiTouch) return;
    if (Math.hypot(event.clientX - downX, event.clientY - downY) > 8) dragged = true;
    if (dragged) commands.adjustSpeed((lastY - event.clientY) * 0.009);
    lastY = event.clientY;
  }, { signal });

  canvas.addEventListener('pointerup', event => {
    if (event.pointerId !== pointerId) return;
    if (!dragged && !multiTouch) commands.togglePause();
    pointerId = null;
  }, { signal });
  const cancel = (): void => { pointerId = null; dragged = true; multiTouch = false; };
  canvas.addEventListener('pointercancel', cancel, { signal });
  canvas.addEventListener('lostpointercapture', cancel, { signal });

  window.addEventListener('keydown', event => {
    if (document.querySelector('dialog[open]')) return;
    const target = event.target as HTMLElement | null;
    if (event.altKey || event.ctrlKey || event.metaKey || target?.isContentEditable || target?.matches('input, textarea, select')) return;
    if (event.code === 'Space') {
      // Focused buttons own their native Space activation; do not toggle twice.
      if (target?.closest('button')) return;
      event.preventDefault(); if (!event.repeat) commands.togglePause();
    } else if (event.key.toLowerCase() === 'r' && !event.repeat) commands.reset();
  }, { signal });
  return () => controller.abort();
}
