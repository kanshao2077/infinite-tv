import type { Commands, FrameState } from '../types.ts';

/** Reading the note suspends the artwork, then restores the visitor's previous play state. */
export function bindCuratorial(commands: Commands, getState: () => FrameState): () => void {
  const dialog = document.querySelector<HTMLDialogElement>('#curatorial')!;
  const trigger = document.querySelector<HTMLButtonElement>('#about')!;
  const close = document.querySelector<HTMLButtonElement>('#close-about')!;
  const events = new AbortController();
  let resumeAfterClose = false;

  trigger.addEventListener('click', () => {
    resumeAfterClose = !getState().paused;
    if (resumeAfterClose) commands.togglePause();
    dialog.showModal(); trigger.setAttribute('aria-expanded', 'true');
  }, { signal: events.signal });
  close.addEventListener('click', () => dialog.close(), { signal: events.signal });
  document.querySelector<HTMLButtonElement>('#close-window')!.addEventListener('click', () => dialog.close(), { signal: events.signal });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }, { signal: events.signal });
  dialog.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    if (resumeAfterClose && getState().paused) commands.togglePause();
    resumeAfterClose = false;
  }, { signal: events.signal });
  return () => { events.abort(); if (dialog.open) dialog.close(); };
}
