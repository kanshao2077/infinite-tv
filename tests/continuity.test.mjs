import test from 'node:test';
import assert from 'node:assert/strict';
import { AnimationEngine } from '../src/core/engine.ts';
import { makeViewport, visibleLayers, layerScale, RECURSION_RATIO, BODY_WIDTH } from '../src/core/geometry.ts';

test('absolute layers remain continuous across every integer camera depth', () => {
  const view = makeViewport(1440, 900, 2);
  for (const boundary of [1, 2, 19, 1000, 1_000_000]) {
    const epsilon = 1e-7;
    const before = visibleLayers(boundary - epsilon, view);
    const after = visibleLayers(boundary + epsilon, view);
    for (const layer of before) {
      const next = after.find(item => item.id === layer.id);
      if (!next) { assert.ok(layer.presence < 1e-5 || layer.opacity < 1e-5); continue; }
      assert.ok(Math.abs(next.scale / layer.scale - RECURSION_RATIO ** (-2 * epsilon)) < 1e-9);
      assert.ok(Math.abs(next.presence - layer.presence) < 1e-5);
    }
  }
});

test('culling never removes an ancestor that can still affect the viewport', () => {
  for (const [w, h] of [[1440, 900], [390, 844], [844, 390], [3840, 2160], [5000, 200]]) {
    const view = makeViewport(w, h, 3);
    for (let depth = 0; depth < 100; depth += 0.071) {
      const layers = visibleLayers(depth, view);
      assert.ok(layers.length > 0 && layers.length <= 20);
      assert.ok(layers.at(-1).scale * BODY_WIDTH > 0.5);
      const first = layers[0];
      if (first.id > 0) {
        const previousScale = layerScale(first.id - 1, depth, view.baseScale);
        assert.ok(Math.min(previousScale * 0.30 / Math.max(view.focusX, w - view.focusX), previousScale * 0.22 / Math.max(view.focusY, h - view.focusY)) >= 2);
      }
    }
  }
});

test('motion and speed smoothing agree at 30, 60 and 120 Hz', () => {
  const results = [30, 60, 120].map(fps => {
    const engine = new AnimationEngine(); engine.tick(0);
    engine.adjustSpeed(0.9);
    for (let n = 1; n <= fps * 15; n++) engine.tick(n * 1000 / fps);
    return engine.state;
  });
  for (const state of results) {
    assert.ok(Math.abs(state.depth - results[0].depth) < 1e-10);
    assert.ok(Math.abs(state.time - 15) < 1e-10);
  }
});

test('pause freezes all simulation state; resume does not catch up wall time', () => {
  const engine = new AnimationEngine(); engine.tick(0); engine.tick(16);
  engine.togglePause(); const frozen = engine.state;
  engine.tick(10000); engine.tick(20000);
  assert.deepEqual(engine.state, frozen);
  engine.togglePause(); engine.tick(90000);
  assert.equal(engine.state.depth, frozen.depth);
  engine.tick(90016); assert.ok(engine.state.depth > frozen.depth);
});

test('speed stays forward and bounded; reset restores the initial state', () => {
  const engine = new AnimationEngine();
  for (let i = 0; i < 100; i++) engine.adjustSpeed(-1);
  assert.equal(engine.state.targetSpeed, 0.1);
  for (let i = 0; i < 100; i++) engine.adjustSpeed(1);
  assert.equal(engine.state.targetSpeed, 4);
  engine.tick(0); engine.tick(500); assert.ok(engine.state.depth < 0.02);
  engine.togglePause(); engine.reset();
  assert.deepEqual(engine.state, { depth: 0, time: 0, speed: 1, targetSpeed: 1, paused: false });
});

test('large layer counts, invalid depth and high DPI remain bounded', () => {
  const view = makeViewport(3840, 2160, 3);
  assert.ok(view.width * view.height * view.dpr ** 2 <= 6_000_001);
  assert.deepEqual(visibleLayers(NaN, view), []);
  for (const depth of [0, 100, 10_000, 1_000_000, 1_000_000_000]) {
    const layers = visibleLayers(depth, view);
    assert.ok(layers.length < 20);
    assert.ok(layers.every(layer => Number.isFinite(layer.scale)));
  }
});
